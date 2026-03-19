# Scope of Work — Autonomous AI Agent Testing Framework

> A framework that autonomously evaluates and tests any AI agent — from writing test cases to generating reports — with zero human-authored tests per agent.

---

## 1. Project Overview

### Problem
Testing AI agents today is done manually — engineers hand-write test prompts, run them against the agent, and visually inspect responses. This approach does not scale, misses edge cases, and produces no consistent quality metrics over time.

### Solution
An autonomous multi-agent framework that accepts a target AI agent (via API endpoint or Git repository), understands what it does, generates a full test suite, executes the tests, evaluates results using an LLM judge, and produces a structured report — with zero human involvement per test run.

### Goal
A production-ready testing framework that works against **any** AI agent regardless of how it is built, what LLM it uses, or where it is deployed.

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

#### Orchestrator
- Central coordinator managing the full pipeline
- State machine: `INIT → PARSE → WRITE → EXECUTE → EVALUATE → REPORT → DONE`
- Retry logic for sub-agent failures
- Resumable runs — persist state to DB so a crashed run can continue

#### Test Case Writer Agent
- Auto-generate test cases from `AgentSpec` using an LLM
- Cover 5 test categories:
  - Happy path
  - Edge cases
  - Adversarial (prompt injection, jailbreak, role confusion)
  - Tool-use correctness
  - Multi-turn conversation
- Define invariants for adversarial tests (things the agent must never do)
- Cache generated test cases in DB — reuse if agent spec is unchanged

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
- Separate LLM judge (not the model being tested) scores every result
- 6 evaluation dimensions:
  - Factual accuracy (LLM judge, 0–10)
  - Tool use correctness (exact match, pass/fail)
  - Instruction following (rubric scoring, 0–10)
  - Safety / refusals (classifier, pass/fail)
  - Consistency across turns (embedding similarity, 0–10)
  - Latency (hard threshold, pass/fail)
- Invariant checker — `CRITICAL FAIL` if any invariant is violated

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
| D3 | Orchestrator | State machine coordinating the full pipeline with retry + resume |
| D4 | Test Case Writer | LLM-powered test generator covering all 5 categories |
| D5 | Adapter Layer | REST, Anthropic, OpenAI, LangChain adapters |
| D6 | Test Executor | Runs all test cases, logs results, integrates with Langfuse |
| D7 | Trace Strategies | 4 trace visibility modes implemented and selectable via config |
| D8 | Evaluation Layer | LLM judge + invariant checker scoring 6 dimensions |
| D9 | Report Generator | Multi-format report output with regression diffing |
| D10 | Storage Layer | PostgreSQL schema + Prisma models |
| D11 | Config System | Per-agent `eval-config.yaml` support |
| D12 | Documentation | Architecture, implementation plan, and usage guide |

---

## 5. Phases & Build Order

### Phase 1 — Foundation *(start here)*
Build the input handler, Repo Parser, and storage schema. At the end of this phase, the framework can accept any input and produce a normalized `AgentSpec`.

**Deliverables:** D1, D2, D10

---

### Phase 2 — Core Pipeline *(MVP loop)*
Build the Orchestrator, Writer, REST Executor (single adapter), and basic LLM judge (2 dimensions). At the end of this phase, the full end-to-end loop works for a single REST agent — no trace visibility, basic scoring.

**Deliverables:** D3 (partial), D4, D5 (REST only), D6 (no trace), D8 (partial)

---

### Phase 3 — Full Execution Layer
Add remaining adapters (Anthropic, OpenAI, LangChain), multi-turn support, Langfuse integration, and all 4 trace strategies.

**Deliverables:** D5 (complete), D6 (complete), D7

---

### Phase 4 — Full Evaluation & Reporting
Complete the LLM judge with all 6 dimensions, invariant checker, full report generator with regression diffing, all output formats.

**Deliverables:** D3 (complete), D8 (complete), D9

---

### Phase 5 — Configuration & Polish
Add the config system, full error handling, retry logic, resumable runs, and documentation.

**Deliverables:** D11, D12

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
