import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { resumeMasterAgent } from '@/agent-eval/core/agent/master-agent'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: runId } = await params

  let body: {
    decision: 'approve_all' | 'approve_with_edits' | 'reject' | 'delete'
    feedback?: string
    editedTests?: unknown[]
    deletedTestIds?: string[]
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { decision, feedback, deletedTestIds } = body

  if (!['approve_all', 'approve_with_edits', 'reject', 'delete'].includes(decision)) {
    return NextResponse.json({ error: 'Invalid decision value' }, { status: 400 })
  }

  const run = await prisma.evalRun.findUnique({
    where: { id: runId },
    include: { testCases: true },
  })

  if (!run) return NextResponse.json({ error: 'Run not found' }, { status: 404 })
  if (run.status !== 'review_pending') {
    return NextResponse.json({ error: `Run is not pending review (status: ${run.status})` }, { status: 400 })
  }

  // Rejection cap
  if (decision === 'reject') {
    const rejectionCount = await prisma.evalReview.count({ where: { runId, decision: 'reject' } })
    if (rejectionCount >= 3) {
      return NextResponse.json(
        { error: 'Maximum rejections (3) reached. Approve or abort the run.' },
        { status: 400 }
      )
    }
  }

  // Save review record
  await prisma.evalReview.create({
    data: { runId, decision, feedback: feedback ?? null },
  })

  // Handle rejection — update DB and return, do not resume
  if (decision === 'reject') {
    await prisma.evalRun.update({ where: { id: runId }, data: { status: 'failed' } })
    return NextResponse.json({
      status: 'rejected',
      message: 'Tests rejected. Start a new run with revised configuration.',
      feedback,
    })
  }

  // Remove deleted tests before approving
  if (decision === 'delete' && deletedTestIds?.length) {
    await prisma.evalTestCase.deleteMany({ where: { id: { in: deletedTestIds }, runId } })
  }

  // Mark remaining tests as approved
  await prisma.evalTestCase.updateMany({
    where: { runId, status: 'pending_review' },
    data: { status: 'approved' },
  })

  // Resume the LangGraph run in the background.
  // Command({ resume: 'approved' }) is passed to graph.invoke() with the same
  // thread_id. LangGraph restores state from MemorySaver and continues from
  // the exact point interrupt() was called inside request_human_review.
  setImmediate(async () => {
    try {
      await resumeMasterAgent(runId, 'approved')
    } catch (err) {
      console.error('[review-api] Resume error:', err)
      await prisma.evalRun.update({ where: { id: runId }, data: { status: 'failed' } })
    }
  })

  const approvedCount = await prisma.evalTestCase.count({ where: { runId, status: 'approved' } })

  return NextResponse.json({
    status: 'approved',
    approvedCount,
    message: `Approved ${approvedCount} tests. Graph resuming execution.`,
    runId,
  })
}
