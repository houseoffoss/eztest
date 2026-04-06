import { PrismaClient } from '@prisma/client'
import type { GeneratedTestCase } from './generate-test-cases'

const prisma = new PrismaClient()

export async function requestHumanReview(
  runId: string,
  tests: GeneratedTestCase[],
  reason: string
): Promise<{ reviewPending: true; message: string }> {
  // Set run status to review_pending — pauses the ReAct loop
  await prisma.evalRun.update({
    where: { id: runId },
    data: { status: 'review_pending' },
  })

  console.log(`[human-review] Run ${runId} is now pending review.`)
  console.log(`[human-review] Reason: ${reason}`)
  console.log(`[human-review] ${tests.length} test(s) awaiting approval.`)
  console.log(`[human-review] POST /api/eval/reviews/${runId} to approve or reject.`)

  return {
    reviewPending: true,
    message: `Run paused. ${tests.length} tests pending human review. Reason: ${reason}. POST /api/eval/reviews/${runId} to continue.`,
  }
}
