import Anthropic from '@anthropic-ai/sdk'
import { PrismaClient } from '@prisma/client'
import { buildWriterPrompt } from '../prompts/master-agent.prompt'
import type { AgentSpec } from '../../input/agent-spec.types'

const client = new Anthropic()
const prisma = new PrismaClient()

export interface GeneratedTestCase {
  id: string
  title: string
  rationale: string
  input: string | Array<{ role: string; content: string }>
  expectedTools: string[]
  expectedOutput: string
  invariants: string[]
  category: string
}

export async function generateTestCases(
  spec: AgentSpec,
  runId: string,
  category: string,
  count: number
): Promise<GeneratedTestCase[]> {
  const prompt = buildWriterPrompt(spec, category, count)

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    throw new Error(`[generate-test-cases] Failed to parse LLM response for category ${category}`)
  }

  const rawCases = JSON.parse(jsonMatch[0]) as Array<{
    title: string
    rationale: string
    input: string | Array<{ role: string; content: string }>
    expectedTools?: string[]
    expectedOutput?: string
    invariants?: string[]
  }>

  // Persist to DB and collect with IDs
  const saved: GeneratedTestCase[] = []
  for (const tc of rawCases) {
    const record = await prisma.evalTestCase.create({
      data: {
        runId,
        category,
        title: tc.title,
        rationale: tc.rationale,
        input: tc.input as object,
        expectedTools: tc.expectedTools ?? [],
        expectedOutput: tc.expectedOutput ?? '',
        invariants: tc.invariants ?? [],
        status: 'pending_review',
      },
    })
    saved.push({
      id: record.id,
      title: tc.title,
      rationale: tc.rationale,
      input: tc.input,
      expectedTools: tc.expectedTools ?? [],
      expectedOutput: tc.expectedOutput ?? '',
      invariants: tc.invariants ?? [],
      category,
    })
  }

  console.log(`[generate-test-cases] Generated ${saved.length} ${category} tests for run ${runId}`)
  return saved
}
