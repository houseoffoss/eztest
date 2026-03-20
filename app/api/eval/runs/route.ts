import { NextRequest, NextResponse } from 'next/server'
import { handleInput } from '@/agent-eval/core/input/input-handler'
import { runMasterAgent } from '@/agent-eval/core/agent/master-agent'
import { loadConfig } from '@/agent-eval/core/config/config-loader'

export async function POST(request: NextRequest) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    const { agentSpec, evalTargetId } = await handleInput(payload as Parameters<typeof handleInput>[0])
    const config = loadConfig()

    // Start the master agent — it will pause at review_pending
    const result = await runMasterAgent({ agentSpec, evalTargetId, config })

    return NextResponse.json({
      runId: result.runId,
      status: result.status,
      message: result.status === 'review_pending'
        ? `Tests generated and pending review. POST /api/eval/reviews/${result.runId} to approve.`
        : 'Run completed.',
    })
  } catch (err) {
    const e = err as Error
    console.error('[runs-api] Error starting run:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Use GET /api/eval/runs/:id for run status' }, { status: 400 })
}
