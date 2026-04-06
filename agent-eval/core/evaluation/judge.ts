import Anthropic from '@anthropic-ai/sdk'
import type { EvalConfig } from '../config/config.types'

const client = new Anthropic()

export interface JudgeInput {
  testInput: string
  expectedBehavior: string
  actualResponse: string
  expectedTools?: string[]
  invariants?: string[]
  toolCallsMade?: Array<{ name: string; params: unknown }>
}

export interface JudgeScore {
  factualAccuracy: number       // 0–10
  instructionFollowing: number  // 0–10
  toolUseCorrectness: number    // 0–10 (10 if no expected tools)
  invariantViolation: boolean   // true = hard FAIL regardless of scores
  reasoning: string
}

export async function judgeResponse(input: JudgeInput, config: EvalConfig): Promise<JudgeScore> {
  // Fast path: check invariants before calling LLM
  const violatedInvariant = (input.invariants ?? []).find(inv =>
    input.actualResponse.toLowerCase().includes(inv.toLowerCase())
  )
  if (violatedInvariant) {
    return {
      factualAccuracy: 0,
      instructionFollowing: 0,
      toolUseCorrectness: 0,
      invariantViolation: true,
      reasoning: `Invariant violated: response contains "${violatedInvariant}"`,
    }
  }

  const toolSection = buildToolSection(input)

  const prompt = `You are an expert AI QA evaluator. Score the agent's response objectively.

Test Input:
${input.testInput}

Expected Behavior:
${input.expectedBehavior}

Actual Agent Response:
${input.actualResponse}
${toolSection}

Score on THREE dimensions (0–10 each):

1. **Factual Accuracy** — Were all claims correct? No hallucinations?
   - 10: All facts correct, no hallucinations
   - 7–9: Mostly correct, minor inaccuracies
   - 4–6: Partially correct, notable errors
   - 0–3: Largely incorrect or hallucinated

2. **Instruction Following** — Did the agent do exactly what was asked?
   - 10: Followed all instructions precisely
   - 8–9: Followed all, minor format deviation
   - 5–7: Followed main instruction, missed secondary requirements
   - 2–4: Partially followed
   - 0–1: Did not follow

3. **Tool Use Correctness** — Did the agent call the right tools?
   - 10: Called exactly the expected tools with correct parameters (or no tools expected)
   - 7–9: Called correct tools, minor parameter deviation
   - 4–6: Called some but not all expected tools
   - 0–3: Called wrong tools or skipped required tools
   - If no tool expectations exist, return 10

Return a JSON object (no text outside the JSON):
{
  "factualAccuracy": <0-10>,
  "instructionFollowing": <0-10>,
  "toolUseCorrectness": <0-10>,
  "reasoning": "<one paragraph explaining all three scores>"
}`

  const response = await client.messages.create({
    model: config.evaluation.judgeModel,
    max_tokens: 512,
    temperature: config.evaluation.judgeTemperature,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error(`[judge] Failed to parse judge response: ${text}`)
  }

  const parsed = JSON.parse(jsonMatch[0]) as JudgeScore
  return {
    factualAccuracy: clamp(parsed.factualAccuracy ?? 0, 0, 10),
    instructionFollowing: clamp(parsed.instructionFollowing ?? 0, 0, 10),
    toolUseCorrectness: clamp(parsed.toolUseCorrectness ?? 10, 0, 10),
    invariantViolation: false,
    reasoning: parsed.reasoning ?? '',
  }
}

function buildToolSection(input: JudgeInput): string {
  const parts: string[] = []

  if (input.expectedTools?.length) {
    parts.push(`Expected Tools to be called: ${input.expectedTools.join(', ')}`)
  }

  if (input.toolCallsMade?.length) {
    parts.push(`Tools Actually Called: ${input.toolCallsMade.map(t => t.name).join(', ')}`)
  } else if (input.expectedTools?.length) {
    parts.push(`Tools Actually Called: (none detected — no trace data available)`)
  }

  return parts.length > 0 ? '\n' + parts.join('\n') : ''
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max)
}
