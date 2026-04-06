import { randomBytes } from 'crypto'
import { PrismaClient } from '@prisma/client'
import { RestAdapter } from '../../adapters/rest.adapter'
import { LangfuseStrategy } from '../../trace/langfuse.strategy'
import { BlackboxStrategy } from '../../trace/blackbox.strategy'
import type { AgentSpec } from '../../input/agent-spec.types'
import type { TraceData } from '../../trace/trace.interface'
import type { GeneratedTestCase } from './generate-test-cases'

const prisma = new PrismaClient()

export interface ExecutionResult {
  testCaseId: string
  input: string | Array<{ role: string; content: string }>
  output: string
  latencyMs: number
  traceData: TraceData | null
  error?: string
  traceUrl?: string
}

export async function executeTest(
  testCase: GeneratedTestCase,
  agentSpec: AgentSpec
): Promise<ExecutionResult> {
  if (!agentSpec.endpoint) {
    throw new Error('[execute-test] AgentSpec has no endpoint — cannot execute test')
  }

  const sessionId = randomBytes(8).toString('hex')
  const adapter = new RestAdapter()
  const traceStrategy = agentSpec.traceStrategy === 'langfuse' && agentSpec.langfuseConfig
    ? new LangfuseStrategy(agentSpec.langfuseConfig)
    : new BlackboxStrategy()

  const before = new Date()
  let output = ''
  let latencyMs = 0
  let error: string | undefined

  try {
    const response = await adapter.send(testCase.input as string | Array<{ role: 'user' | 'assistant'; content: string }>, {
      endpoint: agentSpec.endpoint,
      sessionId,
      timeoutMs: 30000,
    })
    output = response.content
    latencyMs = response.latencyMs
  } catch (err) {
    const e = err as Error & { latencyMs?: number }
    error = e.message
    latencyMs = e.latencyMs ?? 0
  }

  const after = new Date()

  // Pull trace from Langfuse (or null for blackbox)
  let traceData: TraceData | null = null
  if (!error) {
    traceData = await traceStrategy.getTrace(sessionId, { before, after })
  }

  // Persist execution result
  const inputStr = typeof testCase.input === 'string' ? testCase.input : JSON.stringify(testCase.input)
  await prisma.evalResult.create({
    data: {
      testCaseId: testCase.id,
      verdict: error ? 'ERROR' : 'FAIL', // updated to PASS/FAIL after judge runs
      latencyMs,
      rawResponse: output || error,
      traceData: traceData ? JSON.parse(JSON.stringify(traceData)) : undefined,
    },
  })

  // Mark test case as executed
  await prisma.evalTestCase.update({
    where: { id: testCase.id },
    data: { status: 'executed' },
  })

  return {
    testCaseId: testCase.id,
    input: testCase.input,
    output,
    latencyMs,
    traceData,
    error,
  }
}
