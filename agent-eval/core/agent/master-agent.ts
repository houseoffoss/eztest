import {
  StateGraph,
  Annotation,
  END,
  START,
  interrupt,
  Command,
} from '@langchain/langgraph'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import { ChatAnthropic } from '@langchain/anthropic'
import { AIMessage, HumanMessage, ToolMessage, BaseMessage } from '@langchain/core/messages'
import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

import { buildMasterAgentSystemPrompt } from './prompts/master-agent.prompt'
import { generateTestCases } from './tools/generate-test-cases'
import { executeTest } from './tools/execute-test'
import { evaluateResult } from './tools/evaluate-result'
import { generateMarkdownReport } from '../report/report-generator'
import { getCheckpointer } from './graph-instance'
import type { AgentSpec, ToolDefinition } from '../input/agent-spec.types'
import type { EvalConfig } from '../config/config.types'
import { DEFAULT_CONFIG } from '../config/config.types'
import type { GeneratedTestCase } from './tools/generate-test-cases'
import type { EvaluationScore } from './tools/evaluate-result'

const prisma = new PrismaClient()

// ─── State ────────────────────────────────────────────────────────────────────
// LangGraph state is an Annotation object. Each field has a reducer that merges
// incoming updates with current state.

const AgentStateAnnotation = Annotation.Root({
  // The full message history — each turn appended via concat reducer
  messages: Annotation<BaseMessage[]>({
    reducer: (current, incoming) => current.concat(incoming),
    default: () => [],
  }),

  // Run metadata (set once at start, never updated)
  runId: Annotation<string>({ reducer: (_cur, val) => val, default: () => '' }),
  agentSpec: Annotation<AgentSpec | null>({ reducer: (_cur, val) => val, default: () => null }),
  config: Annotation<EvalConfig | null>({ reducer: (_cur, val) => val, default: () => null }),

  // Accumulated test data — appended across multiple tool calls
  generatedTests: Annotation<GeneratedTestCase[]>({
    reducer: (current, incoming) => current.concat(incoming),
    default: () => [],
  }),
  results: Annotation<EvaluationScore[]>({
    reducer: (current, incoming) => current.concat(incoming),
    default: () => [],
  }),

  // Flags
  reportGenerated: Annotation<boolean>({ reducer: (_cur, val) => val, default: () => false }),
})

type AgentState = typeof AgentStateAnnotation.State

// ─── Tool builder ─────────────────────────────────────────────────────────────
// Tools are built with state context injected via closure so they can access
// runId, agentSpec, generatedTests etc. at execution time.

function buildTools(state: AgentState) {
  const generateTestCasesTool = tool(
    async ({ category, count }: { category: string; count: number }) => {
      const newTests = await generateTestCases(state.agentSpec!, state.runId, category, count)
      // Return value becomes the ToolMessage content seen by Claude
      return JSON.stringify({ generated: newTests.length, category, testIds: newTests.map(t => t.id) })
    },
    {
      name: 'generate_test_cases',
      description: 'Generate test cases for a specific category. Call multiple times for different categories.',
      schema: z.object({
        category: z.enum(['happy_path', 'edge_case', 'adversarial', 'tool_use', 'multi_turn']),
        count: z.number().describe('Number of test cases to generate'),
        focus: z.string().optional().describe('Specific aspect to focus on'),
      }),
    }
  )

  const requestHumanReviewTool = tool(
    async ({ reason }: { reason: string }) => {
      // Save review_pending status to DB
      await prisma.evalRun.update({
        where: { id: state.runId },
        data: { status: 'review_pending' },
      })

      // interrupt() pauses the graph here and serialises state into the checkpointer.
      // Execution will resume when graph.invoke(new Command({ resume: decision })) is called
      // with the same thread_id. The value passed to resume() becomes the return value here.
      const decision = interrupt({
        reason,
        pendingTestCount: state.generatedTests.length,
        message: `Run paused. POST /api/eval/reviews/${state.runId} to approve or reject.`,
      })

      return JSON.stringify({ resumed: true, decision })
    },
    {
      name: 'request_human_review',
      description: 'Pause execution and wait for human approval before running any tests. MUST be called before execute_and_evaluate.',
      schema: z.object({
        reason: z.string().describe('Why you are requesting review at this point'),
      }),
    }
  )

  const executeAndEvaluateTool = tool(
    async ({ test_case_id }: { test_case_id: string }) => {
      const testCase = state.generatedTests.find(t => t.id === test_case_id)
      if (!testCase) return JSON.stringify({ error: `Test case ${test_case_id} not found` })

      const execution = await executeTest(testCase, state.agentSpec!)
      const score = await evaluateResult(testCase, execution, state.config!)

      return JSON.stringify({
        verdict: score.verdict,
        compositeScore: Number(score.compositeScore.toFixed(2)),
        factualAccuracy: score.factualAccuracy,
        instructionFollowing: score.instructionFollowing,
        toolUseCorrectness: score.toolUseCorrectness,
        invariantViolation: score.invariantViolation,
        error: execution.error ?? null,
      })
    },
    {
      name: 'execute_and_evaluate',
      description: 'Execute a single approved test case and evaluate the result. Only call after human review approval.',
      schema: z.object({
        test_case_id: z.string().describe('ID of an approved test case to execute'),
      }),
    }
  )

  const detectPatternTool = tool(
    async () => {
      const failures = state.results.filter(r => r.verdict === 'FAIL' || r.verdict === 'ERROR')
      if (failures.length === 0) return JSON.stringify({ failureCount: 0, summary: 'No failures detected yet' })
      const summary = failures.map(f =>
        `Test ${f.testCaseId}: score=${f.compositeScore.toFixed(1)}, reasoning=${f.judgeReasoning}`
      ).join('\n')
      return JSON.stringify({ failureCount: failures.length, summary })
    },
    {
      name: 'detect_pattern',
      description: 'Analyse all current failures to identify recurring patterns. Call when you have 3 or more failures.',
      schema: z.object({}),
    }
  )

  const generateReportTool = tool(
    async ({ summary }: { summary: string }) => {
      const avgScore = state.results.length > 0
        ? state.results.reduce((s, r) => s + r.compositeScore, 0) / state.results.length
        : 0

      // Upsert report in DB
      const existing = await prisma.evalReport.findUnique({ where: { runId: state.runId } })
      if (existing) {
        await prisma.evalReport.update({
          where: { runId: state.runId },
          data: { runScore: avgScore, suggestions: summary },
        })
      } else {
        await prisma.evalReport.create({
          data: {
            runId: state.runId,
            runScore: avgScore,
            categoryScores: {},
            failurePatterns: [],
            suggestions: summary,
          },
        })
      }

      // Write markdown file
      const reportPath = await generateMarkdownReport(state.runId, state.results)

      return JSON.stringify({ reportGenerated: true, reportPath, score: avgScore.toFixed(1) })
    },
    {
      name: 'generate_report',
      description: 'Generate the final evaluation report. Call only when you have sufficient evidence to conclude the evaluation.',
      schema: z.object({
        summary: z.string().describe('Your evaluation summary and key findings'),
      }),
    }
  )

  return [
    generateTestCasesTool,
    requestHumanReviewTool,
    executeAndEvaluateTool,
    detectPatternTool,
    generateReportTool,
  ]
}

// ─── Graph builder ────────────────────────────────────────────────────────────

async function buildGraph(agentSpec: AgentSpec, config: EvalConfig) {
  const systemPrompt = buildMasterAgentSystemPrompt(agentSpec)

  // ── Agent node ──
  // Called every iteration of the ReAct loop.
  // Reads the current message history from state, calls Claude, returns new messages.
  async function agentNode(state: AgentState): Promise<Partial<AgentState>> {
    const tools = buildTools(state)
    const model = new ChatAnthropic({
      model: 'claude-sonnet-4-6',
      maxTokens: 4096,
      topP: 1,        // explicit value — @langchain/anthropic sends -1 by default which is invalid
      topK: undefined,
    }).bindTools(tools)

    // Prepend system content as a SystemMessage (LangChain convention)
    const { SystemMessage } = await import('@langchain/core/messages')
    const messagesWithSystem: BaseMessage[] = [
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]

    const response = await model.invoke(messagesWithSystem)
    return { messages: [response] }
  }

  // ── Tool executor node ──
  // Reads tool_call blocks from the last AIMessage.
  // Executes each tool and returns ToolMessages with the results.
  // LangGraph's built-in ToolNode handles this automatically.
  // We rebuild it with fresh tool instances each call so closures capture latest state.
  async function toolExecutorNode(state: AgentState): Promise<Partial<AgentState>> {
    const tools = buildTools(state)
    const toolsByName = Object.fromEntries(tools.map(t => [t.name, t]))

    const lastMessage = state.messages.at(-1) as AIMessage
    if (!lastMessage?.tool_calls?.length) return {}

    const toolMessages: ToolMessage[] = []
    const newTests: GeneratedTestCase[] = []
    const newResults: EvaluationScore[] = []
    let reportGenerated = false

    for (const toolCall of lastMessage.tool_calls) {
      const toolFn = toolsByName[toolCall.name]
      if (!toolFn) {
        toolMessages.push(new ToolMessage({
          content: JSON.stringify({ error: `Unknown tool: ${toolCall.name}` }),
          tool_call_id: toolCall.id ?? '',
        }))
        continue
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (toolFn as any).invoke(toolCall.args)
        const resultStr = typeof result === 'string' ? result : JSON.stringify(result)
        toolMessages.push(new ToolMessage({ content: resultStr, tool_call_id: toolCall.id ?? '' }))

        // Collect side-effect data from tool results to update state
        const parsed = JSON.parse(resultStr) as Record<string, unknown>

        if (toolCall.name === 'generate_test_cases' && parsed['testIds']) {
          // Fetch the newly created test cases from DB to add to state
          const ids = parsed['testIds'] as string[]
          const fetched = await prisma.evalTestCase.findMany({ where: { id: { in: ids } } })
          newTests.push(...fetched.map(tc => ({
            id: tc.id,
            title: tc.title,
            rationale: tc.rationale,
            input: tc.input as string | Array<{ role: string; content: string }>,
            expectedTools: (tc.expectedTools as string[]) ?? [],
            expectedOutput: tc.expectedOutput ?? '',
            invariants: (tc.invariants as string[]) ?? [],
            category: tc.category,
          })))
        }

        if (toolCall.name === 'execute_and_evaluate' && parsed['verdict']) {
          const testCaseId = (toolCall.args as { test_case_id: string }).test_case_id
          newResults.push({
            testCaseId,
            verdict: parsed['verdict'] as 'PASS' | 'FAIL' | 'ERROR',
            compositeScore: parsed['compositeScore'] as number,
            factualAccuracy: parsed['factualAccuracy'] as number,
            instructionFollowing: parsed['instructionFollowing'] as number,
            toolUseCorrectness: (parsed['toolUseCorrectness'] as number) ?? 10,
            judgeReasoning: '',
            invariantViolation: (parsed['invariantViolation'] as boolean) ?? false,
          })
        }

        if (toolCall.name === 'generate_report') reportGenerated = true
      } catch (err) {
        const e = err as Error
        toolMessages.push(new ToolMessage({
          content: JSON.stringify({ error: e.message }),
          tool_call_id: toolCall.id ?? '',
        }))
      }
    }

    return {
      messages: toolMessages,
      generatedTests: newTests,
      results: newResults,
      ...(reportGenerated ? { reportGenerated: true } : {}),
    }
  }

  // ── Routing ──
  // Called after agentNode to decide: call tools or end.
  function routeAfterAgent(state: AgentState): 'tools' | typeof END {
    const last = state.messages.at(-1) as AIMessage
    if (last?.tool_calls?.length) return 'tools'
    return END
  }

  // ── Build and compile ──
  const checkpointer = getCheckpointer()
  await checkpointer.setup()

  return new StateGraph(AgentStateAnnotation)
    .addNode('agent', agentNode)
    .addNode('tools', toolExecutorNode)
    .addEdge(START, 'agent')
    .addConditionalEdges('agent', routeAfterAgent, { tools: 'tools', [END]: END })
    .addEdge('tools', 'agent')
    .compile({ checkpointer })
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface MasterAgentOptions {
  agentSpec: AgentSpec
  evalTargetId: string
  config: EvalConfig
}

export interface AgentRunResult {
  runId: string
  status: 'completed' | 'review_pending' | 'failed'
  results: EvaluationScore[]
}

export async function runMasterAgent(options: MasterAgentOptions): Promise<AgentRunResult> {
  const { agentSpec, evalTargetId, config } = options

  const run = await prisma.evalRun.create({
    data: { targetId: evalTargetId, status: 'running' },
  })
  const runId = run.id
  console.log(`[master-agent] Starting LangGraph run ${runId}`)

  const graph = await buildGraph(agentSpec, config)

  const initialState: Partial<AgentState> = {
    messages: [
      new HumanMessage(
        `Begin evaluation. Run ID: ${runId}. ` +
        `Generate test cases across all relevant categories, then request human review, ` +
        `then execute approved tests, then generate the final report.`
      ),
    ],
    runId,
    agentSpec,
    config,
    generatedTests: [],
    results: [],
    reportGenerated: false,
  }

  // thread_id = runId — this is how the checkpointer identifies this run's state
  const threadConfig = { configurable: { thread_id: runId } }

  try {
    const finalState = await graph.invoke(initialState, threadConfig) as AgentState

    if (finalState.reportGenerated) {
      const avgScore = finalState.results.length > 0
        ? finalState.results.reduce((s, r) => s + r.compositeScore, 0) / finalState.results.length
        : 0

      await prisma.evalRun.update({
        where: { id: runId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          compositeScore: avgScore,
          verdict: scoreToVerdict(avgScore),
        },
      })

      const passCount = finalState.results.filter(r => r.verdict === 'PASS').length
      console.log(`[master-agent] Completed. ${passCount}/${finalState.results.length} passed. Score: ${avgScore.toFixed(1)}`)
      return { runId, status: 'completed', results: finalState.results }
    }

    // Graph was interrupted at request_human_review
    console.log(`[master-agent] Run ${runId} paused for human review`)
    return { runId, status: 'review_pending', results: [] }
  } catch (err) {
    const e = err as Error
    console.error(`[master-agent] Run ${runId} failed:`, e.message)
    await prisma.evalRun.update({ where: { id: runId }, data: { status: 'failed' } })
    return { runId, status: 'failed', results: [] }
  }
}

// Resume a paused run after human approves/rejects via the review API.
// Rebuilds the graph from the EvalTarget record in DB, then invokes with
// Command({ resume }) — the SqliteSaver checkpointer restores the full
// serialised state from where interrupt() was called.
export async function resumeMasterAgent(
  runId: string,
  decision: 'approved' | 'rejected'
): Promise<AgentRunResult> {
  console.log(`[master-agent] Resuming run ${runId} with decision: ${decision}`)

  // Load agentSpec from DB so we can rebuild the graph structure
  const run = await prisma.evalRun.findUnique({
    where: { id: runId },
    include: { target: true },
  })
  if (!run) throw new Error(`[master-agent] Run ${runId} not found`)

  const t = run.target
  const agentSpec: AgentSpec = {
    name: t.name,
    description: 'Resumed evaluation',
    endpoint: t.endpoint ?? undefined,
    agentType: (t.agentType ?? 'rest') as AgentSpec['agentType'],
    systemPrompt: t.systemPrompt ?? undefined,
    tools: (t.toolSchema as ToolDefinition[]) ?? [],
    inputType: t.inputType as AgentSpec['inputType'],
    repoUrl: t.repoUrl ?? undefined,
    repoBranch: t.repoBranch ?? undefined,
    traceStrategy: t.traceStrategy as AgentSpec['traceStrategy'],
  }

  await prisma.evalRun.update({ where: { id: runId }, data: { status: 'running' } })

  // Rebuild graph — same structure, same SqliteSaver file → state is restored automatically
  const graph = await buildGraph(agentSpec, DEFAULT_CONFIG)
  const threadConfig = { configurable: { thread_id: runId } }

  try {
    const finalState = await graph.invoke(
      new Command({ resume: decision }),
      threadConfig
    ) as AgentState

    if (finalState.reportGenerated) {
      const avgScore = finalState.results.length > 0
        ? finalState.results.reduce((s, r) => s + r.compositeScore, 0) / finalState.results.length
        : 0

      await prisma.evalRun.update({
        where: { id: runId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          compositeScore: avgScore,
          verdict: scoreToVerdict(avgScore),
        },
      })

      return { runId, status: 'completed', results: finalState.results }
    }

    return { runId, status: 'review_pending', results: [] }
  } catch (err) {
    const e = err as Error
    console.error(`[master-agent] Resume failed for run ${runId}:`, e.message)
    await prisma.evalRun.update({ where: { id: runId }, data: { status: 'failed' } })
    return { runId, status: 'failed', results: [] }
  }
}

function scoreToVerdict(score: number): string {
  if (score >= 9.0) return 'excellent'
  if (score >= 7.0) return 'good'
  if (score >= 5.0) return 'needs_improvement'
  return 'poor'
}
