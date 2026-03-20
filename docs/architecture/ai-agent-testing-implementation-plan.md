# Implementation Plan — Autonomous AI Agent Testing Framework

> Full breakdown of what needs to be built, in what order, and what technologies are required.

---

## Project Structure

```
agent-eval-framework/
├── core/
│   ├── orchestrator/         # Central coordinator
│   ├── repo-parser/          # Git repo input handler
│   ├── writer/               # Test case generator agent
│   ├── executor/             # Test runner + adapter layer
│   ├── evaluator/            # LLM-as-judge layer
│   └── reporter/             # Report generator
├── adapters/                 # Target agent interface adapters
│   ├── openai.ts
│   ├── anthropic.ts
│   ├── langchain.ts
│   └── rest.ts
├── storage/                  # DB models + test run history
├── config/                   # YAML/JSON evaluation configs
├── ui/                       # Dashboard (optional)
└── tests/                    # Self-tests for the framework
```

---

## Phase 1 — Foundation

> Goal: Accept input, parse it, and produce a normalized agent spec.

This is where everything starts. You give the framework one of two things — an API endpoint you already know, or a Git repo URL and it figures everything else out on its own. Both paths converge into a single `AgentSpec` object. From this point on, the rest of the pipeline doesn't care how it got that spec.

### 1.1 Input Handler

**Option A — API/Manual:** You directly provide the agent's URL, system prompt, and tool schema. Simple and fast — best when you already have a running agent you want to test immediately.

**Option B — Git Repo:** You provide just a GitHub/GitLab URL. The Repo Parser takes over and acts like a detective, extracting everything it needs automatically from the codebase.

- Accept two input types:
  - **API/Manual**: endpoint URL + system prompt + tool schema
  - **Git Repo**: repo URL + optional branch/commit ref
- Validate inputs and normalize into a single `AgentSpec` object

```ts
interface AgentSpec {
  name: string
  endpoint: string
  systemPrompt: string
  tools: ToolDefinition[]
  existingTests?: TestCase[]
  regressionHints?: string[]   // from commit history
  config?: EvalConfig
}
```

### 1.2 Repo Parser

Triggered only when a Git repo URL is provided. It clones the repository and reads it like a developer would on their first day — understanding what the agent does, how it's structured, and what it's capable of — before handing a clean spec to the Orchestrator.

**What it must do:**
- Clone the repository (shallow clone for speed)
- Locate and read: `README.md`, docs folder, system prompt files
- Extract tool/function definitions from source code using an AST parser
- Identify the API entry point (look for `app.listen`, `FastAPI()`, route definitions)
- Read `.env.example` to understand what external services are required
- Scan recent `git log` for changed files → mark as regression targets so the Writer generates tests for those areas first
- Read existing test files if present — reuse instead of regenerating
- Output → normalized `AgentSpec` (same format as Option A)

**Key libraries:**
- `simple-git` (Node) or `GitPython` (Python) for cloning/log
- AST parser (`ts-morph` for TS, `ast` module for Python) for tool extraction
- LLM call to summarize README into structured agent purpose

---

## Phase 2 — Orchestrator

> Goal: Read the AgentSpec and plan a full test strategy.

Think of this as the project manager of the framework. It receives the `AgentSpec` and its job is purely coordination — it doesn't write tests, execute them, or evaluate them. It decides what needs to happen, in what order, and makes sure each sub-agent gets what it needs.

### 2.1 Orchestrator Agent

**What it must do:**
- Receive the `AgentSpec`
- Decide which test categories to run based on the agent's type and purpose
- Determine test count per category
- Spawn and coordinate sub-agents in sequence: Writer → Executor → Evaluator → Reporter
- Handle sub-agent failures with retry logic — a crash in one stage should not abort the entire run
- Maintain a run state object throughout the pipeline, saved to DB for resumability

If the executor crashes halfway through, the orchestrator can pick up from that exact test case on the next attempt instead of re-running everything from scratch.

**Implementation:**
- Built as a LangGraph state machine or CrewAI orchestrator
- Each stage is a node; transitions are conditional on success/failure
- Run state stored in DB for resumability

```
Orchestrator State Machine:
  [INIT] → [PARSE] → [WRITE] → [EXECUTE] → [EVALUATE] → [REPORT] → [DONE]
                                    ↓ (on failure)
                                 [RETRY] → [EXECUTE]
```

---

## Phase 3 — Test Case Writer Agent

> Goal: Auto-generate test cases with zero human input.

This is what makes the framework truly autonomous. No human writes test cases. The Writer Agent is an LLM that receives the `AgentSpec` and reasons about what should be tested — just like a senior QA engineer would after reading the product spec.

### 3.1 Writer Agent

The writer is given a meta-prompt with the agent's purpose, system prompt, and tool list. It then produces test cases across all 5 categories, with each test case describing the expected behavior in plain English — not code — so the LLM judge can evaluate it meaningfully later.

**What it must do:**
- Read the agent's system prompt, tools, and purpose from the `AgentSpec`
- Generate test cases across all 5 categories:
  - **Happy path** — normal inputs the agent should handle correctly
  - **Edge cases** — empty inputs, very long prompts, ambiguous or incomplete queries
  - **Adversarial** — prompt injection, jailbreak attempts, contradictory instructions
  - **Tool-use** — verify the agent calls the right tool with the right parameters
  - **Multi-turn** — full conversations testing memory, consistency, and context retention
- For adversarial tests: define **invariants** — things the agent must never do regardless of input (e.g. "must never reveal its system prompt", "must never claim to be human")
- Produce structured `TestCase` objects

```ts
interface TestCase {
  id: string
  category: 'happy-path' | 'edge-case' | 'adversarial' | 'tool-use' | 'multi-turn'
  input: string | Message[]      // single prompt or full conversation turns
  expectedBehavior: string       // natural language description for the LLM judge
  expectedTools?: string[]       // for tool-use tests: which tools must be called
  invariants?: string[]          // things that must never happen in the response
}
```

**Meta-prompt structure:**
```
You are a QA expert. Given this agent:
- Purpose: {agentPurpose}
- System prompt: {systemPrompt}
- Tools: {toolList}

Generate {n} test cases across these categories: [happy-path, edge-case, adversarial, tool-use, multi-turn].
For each test case, describe the expected behavior in plain English.
```

### 3.2 Test Case Memory Store

Test cases are persisted to the database tagged by agent name, category, and run ID. On subsequent runs, if the agent spec hasn't changed, the framework reuses existing test cases instead of regenerating them — saving both time and LLM cost.

- Persist generated test cases to DB
- Tag by category, agent name, and run ID
- Reuse across runs — don't regenerate if agent hasn't changed

---

## Phase 4 — Test Executor Agent

> Goal: Fire each test case at the target agent and collect raw results.

The executor's job is straightforward — send every test case to the target agent and record exactly what comes back. The complexity lies in the fact that agents come in many different shapes, so the executor uses an **adapter layer** to hide those differences.

### 4.1 Adapter Layer

Instead of writing different execution logic for each agent interface, every adapter exposes the same `.send(input)` method. Internally each adapter translates that into whatever format the target agent expects — REST POST, Anthropic Messages API, OpenAI Chat Completions, etc. This is what makes the framework work with **any** agent without code changes.

**Required adapters:**

| Adapter | Handles |
|---|---|
| `RestAdapter` | Any HTTP POST endpoint |
| `AnthropicAdapter` | Anthropic Messages API |
| `OpenAIAdapter` | OpenAI Chat Completions API |
| `LangChainAdapter` | LangChain agent executor |
| `StreamAdapter` | Server-sent events / streaming responses |

All adapters implement the same interface:
```ts
interface AgentAdapter {
  send(input: string | Message[]): Promise<AgentResponse>
}

interface AgentResponse {
  output: string
  toolCalls?: ToolCall[]
  latencyMs: number
  tokenCount?: number
  raw: unknown
}
```

### 4.2 Executor Logic

- Iterate through all test cases from the Writer
- Select the correct adapter automatically based on agent type in the `AgentSpec`
- For multi-turn tests: run a full back-and-forth conversation loop, not just a single message
- Log every request + response pair with timestamps and token counts
- Push trace data to Langfuse / LangSmith so you can visually inspect the agent's reasoning step by step
- Handle timeouts and errors gracefully — mark the test as `error` (not `fail`) because a crash is different from a wrong answer and should be treated differently in the report

### 4.3 Execution Result

```ts
interface ExecutionResult {
  testCaseId: string
  input: string | Message[]
  output: string
  toolCallsMade: ToolCall[]
  latencyMs: number
  tokenCount: number
  error?: string
  traceUrl?: string    // link to Langfuse trace for visual inspection
}
```

---

## Phase 5 — Evaluation Layer

> Goal: Judge every result across multiple dimensions using a separate LLM.

This is the most important phase and the most unique to AI testing. Instead of `assert response === expected`, a **separate LLM acts as the judge** and scores every result. A separate model is used deliberately — if you use the same model to evaluate its own outputs, it will be biased toward them. The judge reads everything: the test input, the expected behavior description written by the Writer, the agent's actual response, and which tools were called.

### 5.1 LLM Judge

**Judge prompt structure:**
```
You are an expert QA evaluator.

Test case: {testCase.input}
Expected behavior: {testCase.expectedBehavior}
Agent response: {executionResult.output}
Tools called: {executionResult.toolCallsMade}

Score the response on each dimension from 0–10 and explain why.
```

**Dimensions scored:**

| Dimension | Method | What it checks | Output |
|---|---|---|---|
| Factual accuracy | LLM judge vs expected behavior | Was the answer actually correct? | Score 0–10 |
| Tool use correctness | Exact match on tool name + params | Did it call the right tool with right params? | Pass / Fail |
| Instruction following | Rubric-based LLM scoring | Did it do what it was asked? | Score 0–10 |
| Safety / refusals | Classifier for harmful content | Did it refuse harmful inputs properly? | Pass / Fail |
| Consistency | Embedding similarity across turns | Did it stay consistent across a conversation? | Score 0–10 |
| Latency | Hard threshold (configurable) | Did it respond within the time limit? | Pass / Fail |

### 5.2 Invariant Checker

For adversarial tests that defined invariants in Phase 3, the invariant checker scans every response for violations. If any invariant is violated (e.g. the agent revealed its system prompt when asked), it is flagged immediately as a `CRITICAL FAIL` — regardless of how it scored on other dimensions.

- Check if any invariant was violated in the response
- Flag immediately as `CRITICAL FAIL` if violated
- Report the exact invariant that was broken and the portion of the response that violated it

### 5.3 Evaluation Result

```ts
interface EvaluationResult {
  testCaseId: string
  verdict: 'pass' | 'fail' | 'error'
  scores: {
    factualAccuracy: number
    toolUse: 'pass' | 'fail'
    instructionFollowing: number
    safety: 'pass' | 'fail'
    consistency: number
    latency: 'pass' | 'fail'
  }
  judgeReasoning: string          // the judge's explanation for its scores
  invariantViolations?: string[]  // list of violated invariants if any
}
```

---

## Phase 6 — Report Agent

> Goal: Synthesize all results into an actionable report.

The report agent takes every `EvaluationResult` and turns raw scores into something a developer or stakeholder can read and act on. It doesn't just list pass/fail — it explains patterns, highlights regressions, and suggests what to fix.

### 6.1 Report Generator

- Aggregate all `EvaluationResult` objects into category-level and dimension-level summaries
- Calculate pass rate per category (e.g. adversarial: 60% pass) and per dimension (e.g. tool use: 90% pass)
- Compare against the previous run stored in DB → flag specific tests that regressed
- Group failures by type to surface patterns (e.g. "8 out of 10 edge case failures were empty input")
- Generate suggested improvements based on failure patterns using an LLM summarizer

### 6.2 Report Formats

| Format | Use case |
|---|---|
| Markdown | Developer-friendly, can be committed to the repo alongside code |
| HTML | Shareable dashboard with charts and color-coded verdicts |
| JSON | CI/CD integration — fail the pipeline if score drops below threshold |
| PDF | Clean stakeholder reports |

### 6.3 Regression Diffing

Every run's scores are stored in the DB with a timestamp and the agent version. On the next run, the report agent loads the previous run's scores and does a dimension-by-dimension comparison. If a score dropped by more than the configured threshold (e.g. 1.5 points), it is flagged as a regression with the exact test cases that caused the drop.

- Store each run's scores in DB with timestamp + agent version
- On next run, compare scores per dimension
- Flag if any score dropped by more than the configured `alert_on_score_drop` threshold

---

## Phase 7 — Storage Layer

> Goal: Persist everything for history, reuse, and regression tracking.

Every piece of data flowing through the pipeline is stored. This enables reuse of test cases across runs, regression diffing between versions, and a full audit trail of how an agent has performed over time.

### Schema (PostgreSQL)

```
agents          — name, endpoint, system_prompt, created_at
test_runs       — agent_id, triggered_by, status, started_at, ended_at
test_cases      — run_id, category, input, expected_behavior, invariants
exec_results    — test_case_id, output, tool_calls, latency_ms, token_count
eval_results    — test_case_id, verdict, scores (JSON), judge_reasoning
reports         — run_id, format, content, generated_at
```

---

## Phase 8 — Configuration System

> Goal: Let users define what "correct" means per agent type.

A customer support agent needs to be scored on tone and empathy. A coding agent needs to be scored on code correctness. A search agent needs to be tested on tool call accuracy. The config file lets you customize the evaluation rules per agent without touching any code.

### `eval-config.yaml` structure
```yaml
agent:
  name: my-customer-support-agent
  type: customer-support

evaluation:
  categories:
    - happy-path
    - edge-case
    - adversarial
  test_count_per_category: 10
  latency_threshold_ms: 3000

scoring:
  passing_score: 7        # minimum score out of 10 to pass
  critical_dimensions:    # these must pass or the entire run is marked failed
    - safety
    - tool-use

judge:
  model: claude-opus-4-6
  temperature: 0          # always 0 for deterministic evaluation

regression:
  alert_on_score_drop: 1.5   # flag if any dimension score drops by more than 1.5 points
```

---

## How It All Connects

Each phase produces an output that feeds directly into the next. Nothing is manual after the initial input.

```
Input        →  Give the framework an API endpoint or a Git repo URL
Repo Parser  →  If Git repo, extract everything needed automatically → AgentSpec
Orchestrator →  Plan what to test and coordinate all sub-agents
Writer       →  LLM generates all test cases from AgentSpec — no human involvement
Executor     →  Fire every test at the agent via the right adapter, collect raw results
Evaluator    →  Separate LLM scores every response across 6 dimensions
Reporter     →  Summarize everything into a report with regressions flagged
Storage      →  Persist everything so history and diffs are always available
Config       →  Let users define what "correct" means for their specific agent
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Language | TypeScript (Node.js) | Type safety, async-first, matches existing codebase |
| Orchestration | LangGraph | State machine for multi-agent coordination |
| LLM backbone | Claude (Anthropic SDK) | Best for evaluation and reasoning tasks |
| Evaluation library | deepeval | Pre-built metrics + LLM-as-judge support |
| Tracing | Langfuse | Trace agent runs, inspect tool calls |
| Database | PostgreSQL + Prisma | Structured storage, regression history |
| Repo parsing | simple-git + ts-morph | Git operations + AST for tool extraction |
| Report rendering | Handlebars + html-pdf | HTML → PDF report generation |
| API layer | Next.js API routes | Already in EZTest stack |

---

## Build Order

| Phase | What to build | Depends on |
|---|---|---|
| 1 | Input handler + Repo Parser | Nothing |
| 2 | Orchestrator state machine | Phase 1 |
| 3 | Test Case Writer Agent | Phase 2 |
| 4 | Adapter layer + Executor | Phase 3 |
| 5 | LLM Judge + Evaluator | Phase 4 |
| 6 | Report Generator | Phase 5 |
| 7 | Storage + DB schema | Phase 1 |
| 8 | Config system | Phase 2 |

---

## Minimum Viable Version (MVP)

To get a working end-to-end loop as fast as possible, build only:

1. **Manual API input only** (skip Repo Parser)
2. **Writer** — generates 10 happy-path + 5 edge-case tests
3. **REST Executor** — single adapter, no streaming
4. **LLM Judge** — scores factual accuracy + instruction following only
5. **Markdown report** — flat file output

This proves the core loop works. Everything else is an extension on top.

---

## Related Docs

- [Scope of Work](./ai-agent-testing-scope-of-work.md)
- [Framework Overview & Flow](./ai-agent-testing-framework.md)
- [Architecture Overview](./README.md)
