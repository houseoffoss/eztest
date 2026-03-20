import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const run = await prisma.evalRun.findUnique({
    where: { id },
    include: {
      testCases: {
        include: { executionResult: true },
        orderBy: { createdAt: 'asc' },
      },
      reviewSessions: { orderBy: { reviewedAt: 'desc' } },
      report: true,
    },
  })

  if (!run) {
    return NextResponse.json({ error: 'Run not found' }, { status: 404 })
  }

  const pendingReviewTests = run.testCases.filter(t => t.status === 'pending_review')
  const approvedTests = run.testCases.filter(t => t.status === 'approved')
  const executedTests = run.testCases.filter(t => t.status === 'executed')

  return NextResponse.json({
    runId: run.id,
    status: run.status,
    compositeScore: run.compositeScore,
    verdict: run.verdict,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    testCounts: {
      total: run.testCases.length,
      pendingReview: pendingReviewTests.length,
      approved: approvedTests.length,
      executed: executedTests.length,
    },
    pendingReviewTests: run.status === 'review_pending' ? pendingReviewTests.map(t => ({
      id: t.id,
      category: t.category,
      title: t.title,
      rationale: t.rationale,
      input: t.input,
      expectedOutput: t.expectedOutput,
      invariants: t.invariants,
    })) : [],
    results: executedTests.map(t => ({
      id: t.id,
      title: t.title,
      category: t.category,
      verdict: t.executionResult?.verdict,
      compositeScore: t.executionResult?.compositeScore,
      factualAccuracy: t.executionResult?.factualAccuracy,
      instructionFollowing: t.executionResult?.instructionFollowing,
      latencyMs: t.executionResult?.latencyMs,
    })),
    report: run.report ? {
      runScore: run.report.runScore,
      markdownPath: run.report.markdownPath,
      generatedAt: run.report.generatedAt,
    } : null,
  })
}
