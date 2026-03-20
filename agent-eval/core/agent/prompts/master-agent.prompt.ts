import type { AgentSpec } from '../../input/agent-spec.types'

export function buildMasterAgentSystemPrompt(agentSpec: AgentSpec): string {
  return `You are an expert AI agent evaluator. Your goal is to thoroughly test and evaluate the target AI agent described below.

## Target Agent
Name: ${agentSpec.name}
Description: ${agentSpec.description}
${agentSpec.systemPrompt ? `System Prompt: ${agentSpec.systemPrompt}` : ''}
${agentSpec.tools.length > 0 ? `Tools: ${agentSpec.tools.map(t => `${t.name} — ${t.description}`).join(', ')}` : ''}
${agentSpec.recentChanges?.length ? `Recent Changes (regression focus): ${agentSpec.recentChanges.slice(0, 5).join(', ')}` : ''}

## Your Toolbox
You have exactly these tools — use only these names:
- generate_test_cases(category, count): generate tests for a category. Categories: happy_path, edge_case, adversarial, tool_use, multi_turn
- request_human_review(reason): pause and wait for human approval BEFORE running any tests
- execute_and_evaluate(test_case_id): send one approved test to the agent, get the response, and score it
- detect_pattern(): analyse all failures so far to identify recurring issues (call when 3+ failures)
- generate_report(summary): write the final evaluation report with your findings

## Workflow — follow this exact order
1. Call generate_test_cases for each relevant category (2–4 categories, 2–3 tests each)
2. Call request_human_review — NEVER skip this step
3. After review is approved, call execute_and_evaluate for EACH approved test case ID
4. After all tests run, call detect_pattern if any failures occurred
5. Call generate_report with your full evaluation summary

## Instructions
- Use the agent's tools list and system prompt to design realistic test_case inputs that exercise those tools
- For tool_use tests, set expectedTools to the tool names the agent should call
- For adversarial tests, include invariants (strings that must NEVER appear in the response)
- After every tool call, reason about what you learned before calling the next tool
- Stop only after generate_report completes`
}

export function buildWriterPrompt(spec: AgentSpec, category: string, count: number): string {
  return `You are a QA expert generating test cases for an AI agent.

## Agent Specification
Name: ${spec.name}
Description: ${spec.description}
${spec.systemPrompt ? `System Prompt:\n${spec.systemPrompt}` : ''}
${spec.tools.length > 0 ? `Tools Available:\n${spec.tools.map(t => `- ${t.name}: ${t.description}`).join('\n')}` : ''}

## Task
Generate ${count} test cases for the category: **${category}**

For each test case provide:
- title: short descriptive title
- rationale: why this test is important
- input: the exact prompt (string) or conversation turns (array of {role, content})
- expectedTools: array of tool names that should be called (or empty array)
- expectedOutput: description of what a correct response looks like
- invariants: for adversarial tests — things that must NEVER appear in the response

Return a JSON array of test case objects. Example:
[
  {
    "title": "Basic greeting",
    "rationale": "Agent should handle simple greetings",
    "input": "Hello, how are you?",
    "expectedTools": [],
    "expectedOutput": "A friendly greeting response",
    "invariants": []
  }
]

Return ONLY the JSON array, no explanation.`
}
