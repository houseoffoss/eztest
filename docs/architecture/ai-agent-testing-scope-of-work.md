# Scope of Work — Autonomous AI Agent Testing Framework

> A true Agentic AI that autonomously evaluates any AI agent — it reasons, plans, acts, and adapts its own testing strategy from input to report with no fixed pipeline.

---

## 1. Project Overview

### Problem
Testing AI agents today is done manually — engineers hand-write test prompts, run them against the agent, and visually inspect responses. This approach does not scale, misses edge cases, and produces no consistent quality metrics over time.

Existing "automated" solutions are agentic **workflows** — fixed pipelines where agents execute assigned tasks in a predetermined sequence. They cannot adapt to what they discover mid-run, cannot probe failures deeper, and cannot change strategy based on evidence.

### Solution
A **true Agentic AI** — a goal-driven agent running a ReAct loop (Reason → Act → Observe → Reason) that decides its own testing strategy at runtime. It accepts a target AI agent (via API endpoint or Git repository), understands what it does, autonomously generates and adapts its test suite, executes tests, probes failures deeper when warranted, evaluates results using an LLM judge, and produces a structured report.

The human review gate is not a fixed pipeline step — the agent decides when it has enough tests ready and when human judgment is appropriate before execution.

### What makes this Agentic AI, not Agentic Workflow

| | Agentic Workflow | This Framework (Agentic AI) |
|---|---|---|
| Flow | Fixed, predetermined | Agent decides every next step |
| Adapts to failures | No | Yes — probes deeper on failures |
| Human review timing | Fixed gate | Agent-initiated when ready |
| Can backtrack | No | Yes |
| Stops when | Pipeline ends | Agent judges goal achieved |

### Goal
A production-ready Agentic AI testing system that works against **any** AI agent regardless of how it is built, what LLM it uses, or where it is deployed.

---

## 2. Objectives

- Eliminate manual test writing for AI agents
- Provide consistent, repeatable quality scores across agent versions
- Detect regressions automatically between deployments
- Support both owned agents (full trace visibility) and third-party agents (black-box)
- Be extensible to new agent interfaces without core changes

---

## 3. Scope

### 3.1 In Scope

#### Input Handling
- Accept target agent via two input modes:
  - **API/Manual** — endpoint URL, system prompt, tool schema
  - **Git Repository** — GitHub/GitLab URL with optional branch/commit ref
- Validate and normalize both inputs into a unified `AgentSpec`

#### Repo Parser *(Git input only)*
- Shallow clone the repository
- Extract system prompt, tool definitions, API entry point from source code
- Read README and docs to understand agent purpose
- Scan recent commit history to identify regression-prone areas
- Read existing test files to reuse rather than regenerate
- Parse `.env.example` for required services

#### Master Agentic AI (ReAct Loop)
- Not an orchestrator with a fixed pipeline — a goal-driven LLM agent running a continuous **ReAct loop** (Reason → Act → Observe → Reason)
- Has a toolbox of capabilities it calls in any order, any number of times, based on what it reasons is needed next
- Phases emerge from the agent's reasoning, not from hardcoded steps:
  - **Understand** — parse repo or probe the agent to build context
  - **Plan & Generate** — generate test cases and scripts based on what was learned
  - **Review** — agent calls `request_human_review` when it judges tests are ready
  - **Execute & Adapt** — runs tests, evaluates each, decides whether to probe deeper
  - **Report** — agent calls `generate_report` when it judges sufficient evidence exists
- Persists state to DB at each reasoning step — run is resumable after a crash
- Stops when the agent itself reasons: "I have thoroughly evaluated this agent"

#### Test Case Writer Agent
- Auto-generate test cases from `AgentSpec` using an LLM
- Cover 5 test categories:
  - Happy path
  - Edge cases
  - Adversarial (prompt injection, jailbreak, role confusion)
  - Tool-use correctness
  - Multi-turn conversation
- For each test case, also generate the **test script** — the exact execution plan (input sequence, tool call expectations, expected output criteria)
- Define invariants for adversarial tests (things the agent must never do)
- Cache generated test cases in DB — reuse if agent spec is unchanged

#### Human Review Gate
The pipeline pauses after test generation and requires explicit user approval before any test is executed against the target agent.

**What the user reviews:**
- **Test Cases** — the list of generated tests, grouped by category, with rationale for each
- **Test Scripts** — the exact execution plan per test (input, expected tool calls, expected output criteria, invariants)

**Review actions:**
- `Approve All` — proceed with all generated tests as-is
- `Approve with edits` — user edits individual test cases or scripts inline before approving
- `Reject with feedback` — user provides feedback; Writer agent regenerates the entire suite incorporating the feedback
- `Delete individual tests` — remove specific test cases before approving the rest

**Constraints:**
- No test is ever executed before an `Approve` action is received
- Rejection loops are capped at 3 regenerations — after that, user must manually approve or abort
- All review decisions (approve/edit/reject + feedback) are stored in DB for audit

#### Test Executor Agent
- Adapter layer supporting 4 agent interfaces:
  - Plain REST API
  - Anthropic Messages API
  - OpenAI Chat Completions API
  - LangChain agent executor
- Multi-turn conversation execution loop
- Logging of every request/response with timestamps, token counts, latency
- Langfuse trace integration (when credentials are provided)
- Error handling — distinguish `error` (crash) from `fail` (wrong answer)

#### Trace Visibility — 4 Strategies
- **Strategy 1 — Shared Langfuse credentials:** Query Langfuse API after each test to pull full trace (tool calls, spans, latency per step)
- **Strategy 2 — Proxy layer:** Framework sits between test and agent, intercepts all outgoing LLM/tool calls, builds its own trace
- **Strategy 3 — SDK wrapper:** Agent loaded as a module inside the framework's process, LLM client wrapped with interceptor for full native trace access *(Docker/local runs only)*
- **Strategy 4 — Black-box:** Input/output only, no trace access *(third-party agents)*

#### Evaluation Layer
A separate LLM judge (never the model being tested) scores every executed test result across 6 dimensions.

**Per-Test Score Card:**

| Dimension | Method | Score Type | Weight |
|---|---|---|---|
| Factual Accuracy | LLM judge compares output to expected criteria | 0–10 | 25% |
| Tool Use Correctness | Exact match on tool name + parameters vs test script expectation | Pass / Fail | 20% |
| Instruction Following | Rubric-based LLM scoring — did it do what was asked | 0–10 | 20% |
| Safety / Refusals | Classifier — did it refuse when it should, respond when it should | Pass / Fail | 15% |
| Consistency | Embedding similarity across multi-turn responses | 0–10 | 10% |
| Latency | Hard threshold from `eval-config.yaml` | Pass / Fail | 10% |

**Composite Score Calculation:**
```
Test Score = (Factual × 0.25) + (Instruction × 0.20) + (Consistency × 0.10)
           + (Tool Use × 0.20) + (Safety × 0.15) + (Latency × 0.10)

Max score = 10.0
Pass threshold = configurable (default: 7.0)
```

**Verdict per test:**
- `PASS` — composite score ≥ threshold AND no Pass/Fail dimension failed
- `FAIL` — composite score < threshold OR any Pass/Fail dimension failed
- `CRITICAL FAIL` — any invariant violated (overrides all other scores)
- `BLOCKED` — agent safety filter refused the adversarial test input (not a failure)
- `ERROR` — agent crashed or returned non-200; not scored, flagged separately

**Aggregate Run Score:**
```
Run Score = average composite score across all PASS + FAIL tests (BLOCKED/ERROR excluded)
Category Score = average per test category (Happy Path, Edge Cases, etc.)
```

**Score Thresholds (configurable):**
- `≥ 9.0` — Excellent
- `7.0–8.9` — Good (default pass)
- `5.0–6.9` — Needs improvement
- `< 5.0` — Poor (auto-flag for immediate review)

- Invariant checker — `CRITICAL FAIL` if any invariant is violated, regardless of score

#### Report Agent
- Aggregate pass/fail and scores per category and per dimension
- Regression diffing against previous run — flag score drops above threshold
- Failure pattern grouping — surface common failure types
- LLM-generated improvement suggestions based on failure patterns
- Output formats: Markdown, HTML, JSON, PDF

#### Storage Layer
- PostgreSQL schema covering:
  - Agents, test runs, test cases, execution results, evaluation results, reports
- Full audit trail per run
- Version-aware — store agent version with each run for regression comparison

#### Configuration System
- Per-agent `eval-config.yaml` defining:
  - Test categories and count per category
  - Passing score threshold
  - Critical dimensions (fail entire run if these fail)
  - Latency threshold
  - LLM judge model and temperature
  - Regression alert threshold

---

### 3.2 Out of Scope

- **UI dashboard** — reports are file-based (Markdown/HTML/JSON/PDF); no web UI in this phase
- **Agent deployment** — framework does not deploy agents to cloud environments; Docker local spin-up is the limit
- **Browser/UI agent testing** — only API-based agents are supported; no Playwright or Selenium integration
- **Real-time monitoring** — framework runs on-demand or via CI/CD; no continuous live monitoring
- **Multi-agent system testing** — tests one target agent per run; orchestrating tests across a pipeline of chained agents is not covered
- **Custom LLM judge fine-tuning** — uses off-the-shelf models (Claude, GPT-4o); no fine-tuning
- **Billing / cost optimization** — token usage is logged but cost optimization is not automated

---

## 4. Deliverables

| # | Deliverable | Description |
|---|---|---|
| D1 | Input Handler | Accepts API/manual and Git repo inputs, outputs `AgentSpec` |
| D2 | Repo Parser | Clones and reads a Git repo, extracts agent spec automatically |
| D3 | Orchestrator | State machine with REVIEW_PENDING gate, retry + resume |
| D4 | Test Case Writer | LLM-powered test + test script generator covering all 5 categories |
| D5 | Human Review Gate | Review interface for test cases and scripts — approve / edit / reject |
| D6 | Adapter Layer | REST, Anthropic, OpenAI, LangChain adapters |
| D7 | Test Executor | Runs approved test cases, logs results, integrates with Langfuse |
| D8 | Trace Strategies | 4 trace visibility modes implemented and selectable via config |
| D9 | Evaluation Layer | LLM judge + weighted scoring + invariant checker across 6 dimensions |
| D10 | Report Generator | Multi-format report output with per-test scores + regression diffing |
| D11 | Storage Layer | PostgreSQL schema + Prisma models |
| D12 | Config System | Per-agent `eval-config.yaml` support |
| D13 | Documentation | Architecture, implementation plan, and usage guide |

---

## 5. Phases & Build Order

### Phase 1 — Foundation *(start here)*
Build the input handler, Repo Parser, and storage schema. At the end of this phase, the framework can accept any input and produce a normalized `AgentSpec`.

**Deliverables:** D1, D2, D10

---

### Phase 2 — Core Pipeline *(MVP loop)*
Build the Orchestrator, Writer (test cases + scripts), Human Review Gate, REST Executor, and basic LLM judge (2 dimensions). At the end of this phase, the full end-to-end loop works — user can review and approve tests before execution.

**Deliverables:** D3 (partial), D4, D5, D6 (REST only), D7 (no trace), D9 (partial)

---

### Phase 3 — Full Execution Layer
Add remaining adapters (Anthropic, OpenAI, LangChain), multi-turn support, Langfuse integration, and all 4 trace strategies.

**Deliverables:** D6 (complete), D7 (complete), D8

---

### Phase 4 — Full Evaluation & Reporting
Complete the LLM judge with all 6 dimensions and weighted scoring, invariant checker, full report generator with per-test score cards and regression diffing, all output formats.

**Deliverables:** D3 (complete), D9 (complete), D10

---

### Phase 5 — Configuration & Polish
Add the config system, full error handling, retry logic, resumable runs, and documentation.

**Deliverables:** D12, D13

---

## 6. Technical Requirements

### Runtime
- Node.js 20+ / TypeScript
- PostgreSQL 15+
- Docker (for local agent spin-up in Phase 3+)

### External Services
- Anthropic API key (LLM judge + Writer agent)
- Langfuse account (optional — for trace visibility Strategy 1 & 2)
- Target agent credentials (API key or repo access)

### Infrastructure
- Any environment that runs Node.js + PostgreSQL
- No cloud provider dependency in the core framework

---

## 7. Assumptions

- The target agent exposes an HTTP interface (REST or compatible API)
- For Git repo input, the repo is accessible (public or credentials provided)
- For Langfuse trace access, the agent owner provides Langfuse project credentials
- The framework is run by someone with access to an Anthropic API key for the LLM judge
- Docker is available in the environment for local agent spin-up (Phase 3+)

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Target agent has no observability | Cannot verify tool calls | Use black-box evaluation (Strategy 4) — output quality still testable |
| LLM judge gives inconsistent scores | Unreliable results | Set judge temperature to 0; use structured output with rubric |
| Repo structure varies widely | Repo Parser fails to extract spec | Fall back to prompting user for missing fields; LLM-assisted extraction as fallback |
| Agent response is non-deterministic | Same test passes/fails across runs | Run each test 3 times, take majority verdict |
| Adversarial tests trigger agent safety filters | Tests blocked | Mark as `blocked` verdict, not `fail` — report separately |

---

## 9. Success Criteria

The framework is considered complete when:

- [ ] Given only a REST endpoint + system prompt, it produces a full test report with no human input
- [ ] Given only a Git repo URL, it extracts the spec and produces a full test report
- [ ] The LLM judge scores are consistent across repeated runs of the same test (±0.5 variance)
- [ ] Regression detection correctly flags a score drop when an agent is intentionally degraded
- [ ] All 4 adapters (REST, Anthropic, OpenAI, LangChain) pass integration tests
- [ ] All 4 trace strategies work and are selectable via config
- [ ] A new agent can be onboarded with only a config file — no code changes

---

## 10. Related Docs

- [Framework Overview & Flow](./ai-agent-testing-framework.md)
- [Implementation Plan](./ai-agent-testing-implementation-plan.md)
- [Architecture Overview](./README.md)
