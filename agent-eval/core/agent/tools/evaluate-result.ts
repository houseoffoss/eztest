import { PrismaClient } from '@prisma/client'
import { judgeResponse } from '../../evaluation/judge'
import type { EvalConfig } from '../../config/config.types'
import type { GeneratedTestCase } from './generate-test-cases'
import type { ExecutionResult } from './execute-test'

const prisma = new PrismaClient()

export interface EvaluationScore {
  testCaseId: string
  verdict: 'PASS' | 'FAIL' | 'ERROR'
  compositeScore: number
  factualAccuracy: number
  instructionFollowing: number
  toolUseCorrectness: number
  judgeReasoning: string
  invariantViolation: boolean
}

export async function evaluateResult(
  testCase: GeneratedTestCase,
  execution: ExecutionResult,
  config: EvalConfig
): Promise<EvaluationScore> {
  if (execution.error) {
    await prisma.evalResult.update({
      where: { testCaseId: testCase.id },
      data: { verdict: 'ERROR', compositeScore: 0, judgeReasoning: `Execution error: ${execution.error}` },
    })
    return {
      testCaseId: testCase.id,
      verdict: 'ERROR',
      compositeScore: 0,
      factualAccuracy: 0,
      instructionFollowing: 0,
      toolUseCorrectness: 0,
      judgeReasoning: `Execution error: ${execution.error}`,
      invariantViolation: false,
    }
  }

  const inputStr = typeof execution.input === 'string'
    ? execution.input
    : execution.input.map(t => `${t.role}: ${t.content}`).join('\n')

  const scores = await judgeResponse(
    {
      testInput: inputStr,
      expectedBehavior: testCase.expectedOutput,
      actualResponse: execution.output,
      expectedTools: testCase.expectedTools,
      invariants: testCase.invariants,
      toolCallsMade: execution.traceData?.toolCallsMade,
    },
    config
  )

  // Hard fail on invariant violation, skip composite scoring
  if (scores.invariantViolation) {
    await prisma.evalResult.update({
      where: { testCaseId: testCase.id },
      data: {
        verdict: 'FAIL',
        compositeScore: 0,
        factualAccuracy: 0,
        instructionFollowing: 0,
        judgeReasoning: scores.reasoning,
      },
    })
    console.log(`[evaluate-result] ${testCase.title}: FAIL (invariant violation)`)
    return {
      testCaseId: testCase.id,
      verdict: 'FAIL',
      compositeScore: 0,
      factualAccuracy: 0,
      instructionFollowing: 0,
      toolUseCorrectness: 0,
      judgeReasoning: scores.reasoning,
      invariantViolation: true,
    }
  }

  // Composite: factualAccuracy(45%) + instructionFollowing(35%) + toolUseCorrectness(20%)
  // If no expectedTools, toolUseCorrectness=10 so the 20% weight is neutral
  const composite =
    scores.factualAccuracy * 0.45 +
    scores.instructionFollowing * 0.35 +
    scores.toolUseCorrectness * 0.20

  const verdict: 'PASS' | 'FAIL' = composite >= config.agent.passThreshold ? 'PASS' : 'FAIL'

  await prisma.evalResult.update({
    where: { testCaseId: testCase.id },
    data: {
      verdict,
      compositeScore: composite,
      factualAccuracy: scores.factualAccuracy,
      instructionFollowing: scores.instructionFollowing,
      judgeReasoning: scores.reasoning,
    },
  })

  console.log(`[evaluate-result] ${testCase.title}: ${verdict} (score: ${composite.toFixed(1)}, tools: ${scores.toolUseCorrectness}/10)`)

  return {
    testCaseId: testCase.id,
    verdict,
    compositeScore: composite,
    factualAccuracy: scores.factualAccuracy,
    instructionFollowing: scores.instructionFollowing,
    toolUseCorrectness: scores.toolUseCorrectness,
    judgeReasoning: scores.reasoning,
    invariantViolation: false,
  }
}
