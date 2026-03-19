# Autonomous AI Agent Testing Framework

> A framework for autonomously evaluating and testing AI agents — from writing test cases to generating reports — with zero human-authored tests per agent.

---

## Overview

Testing AI agents is fundamentally different from testing web applications. Web app testing verifies **deterministic behavior** (click button → expect modal). AI agent testing verifies **emergent, probabilistic behavior** — the agent reasons and decides differently each run, and "correct" is often subjective.

This framework solves that by using **an AI to test an AI**, with a multi-stage pipeline from input to report.

---

## End-to-End Flow

```
┌─────────────────────────────────────────────────────────┐
│                        INPUT                            │
│                                                         │
│   Option A — API / Manual                               │
│   ├── Target agent's API endpoint                       │
│   ├── System prompt / tool schema                       │
│   └── (Optional) golden dataset or test config          │
│                                                         │
│   Option B — Git Repository                             │
│   ├── Repo URL (GitHub, GitLab, etc.)                   │
│   └── (Optional) branch / commit ref                   │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│               REPO PARSER  (if Git input)               │
│   - Clones / reads the repository                       │
│   - Extracts: README, docs, system prompts              │
│   - Extracts: tool/function definitions & schemas       │
│   - Identifies: API entry point & environment config    │
│   - Reads: existing tests (if any) to build on top      │
│   - Scans: recent commits → flags areas for regression  │
│   - Outputs: structured agent spec → Orchestrator       │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   ORCHESTRATOR                          │
│   - Reads the agent's spec                              │
│   - Plans what types of tests to run                    │
│   - Delegates to sub-agents                             │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              TEST CASE WRITER AGENT                     │
│   - Auto-generates test cases by reasoning about        │
│     the agent's purpose                                 │
│                                                         │
│   Generates tests for:                                  │
│   ├── Happy path (normal inputs)                        │
│   ├── Edge cases (empty, too long, ambiguous)           │
│   ├── Adversarial (prompt injection, jailbreak)         │
│   ├── Tool-use (did it pick the right tool?)            │
│   └── Multi-turn conversations                          │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│               TEST EXECUTOR AGENT                       │
│   - Sends each test case to the target agent            │
│   - Supports any interface (REST, streaming,            │
│     function calling, multi-turn chat)                  │
│   - Logs every request + response + timestamps          │
│   - Captures tool call traces (e.g. Langfuse)           │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│               EVALUATION LAYER                          │
│   (A separate LLM judges the results)                   │
│                                                         │
│   Scores across dimensions:                             │
│   ├── Factual accuracy        → LLM judge               │
│   ├── Tool use correctness    → Exact match             │
│   ├── Instruction following   → Rubric scoring          │
│   ├── Safety / refusals       → Classifier              │
│   ├── Consistency             → Embedding similarity    │
│   └── Latency / cost          → Hard metrics            │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                 REPORT AGENT                            │
│   - Pass/Fail per test case                             │
│   - Aggregate score per dimension                       │
│   - Regression diff (vs previous version)              │
│   - Suggested improvements                              │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    END RESULT                           │
│   - HTML / Markdown report                              │
│   - Score dashboard                                     │
│   - List of failures with reasoning                     │
│   - Auto-filed bug tickets (optional)                   │
└─────────────────────────────────────────────────────────┘
```

---

## Stage Breakdown

### 1. Input

The framework accepts two types of input:

**Option A — API / Manual**
Provide the target agent's API endpoint, system prompt, and tool schema directly. An optional golden dataset or YAML config can define what "correct" means for that specific agent.

**Option B — Git Repository**
Provide the agent's Git repo URL. This is a richer input — the framework extracts everything it needs automatically.

| Extracted from Repo | What it tells the framework |
|---|---|
| `README.md` / docs | Agent's purpose, capabilities, expected behavior |
| System prompt files | Exact instructions the agent follows |
| Tool / function definitions | What tools exist, their parameters, what they do |
| Existing test files | Prior test cases to build on top of |
| Recent commit history | Changed areas → auto-generate regression tests |
| `.env.example` | What services and API keys are needed to run it |

### 1a. Repo Parser *(Git input only)*
When a Git repo is provided, the Repo Parser clones the repository, reads and structures all relevant files, identifies the API entry point, and outputs a normalized agent spec — the same format the Orchestrator receives from a manual API input. This makes both input paths interchangeable from the Orchestrator's perspective.

### 2. Orchestrator
The central brain. It reads the agent's spec, plans the testing strategy, and delegates tasks to the writer, executor, and evaluator sub-agents. It handles failures and retries automatically.

### 3. Test Case Writer Agent
Auto-generates all test cases — no human writes tests per agent. It reasons about the agent's domain and produces tests across five categories:

| Category | Purpose |
|---|---|
| Happy path | Verify normal inputs produce correct outputs |
| Edge cases | Empty inputs, very long prompts, ambiguous queries |
| Adversarial | Prompt injection, jailbreak attempts, conflicting instructions |
| Tool-use | Did the agent call the right tool with the right parameters? |
| Multi-turn | Memory, consistency, and context retention across a conversation |

### 4. Test Executor Agent
Fires each test case at the target agent via its interface (REST API, streaming, function calling, or multi-turn chat). Logs every request/response pair with timestamps, token counts, and raw outputs. Integrates with tracing tools like Langfuse to capture tool call spans.

### 5. Evaluation Layer
A **separate LLM** acts as the judge — not the model being tested, to avoid self-evaluation bias. It scores results across six dimensions:

| Dimension | Method |
|---|---|
| Factual accuracy | LLM judge with ground truth comparison |
| Tool use correctness | Exact match on function name + parameters |
| Instruction following | Rubric-based LLM scoring |
| Safety / refusals | Classifier for harmful content |
| Consistency | Embedding similarity across turns |
| Latency / cost | Hard metrics |

### 6. Report Agent
Synthesizes all evaluation results into a structured output with pass/fail per test case, aggregate scores per dimension, regression diffs between agent versions, and suggested improvements.

### 7. End Result
A complete test report delivered as HTML, Markdown, or a dashboard — with optional auto-filed bug tickets.

---

## Testing Approaches

Beyond scripted tests (like Selenium for web apps), this framework supports approaches that have no web-testing equivalent:

| Approach | What it does |
|---|---|
| **Scripted tests** | Hand-written prompts, check responses |
| **LLM-as-judge** | Another AI scores the output quality |
| **Behavioral contracts** | Define what the agent must never do — invariants |
| **Conversation simulation** | Synthetic user runs 10–20 turn dialogues |
| **Perturbation testing** | Rephrase inputs slightly, check reasoning consistency |
| **Golden dataset evals** | Compare against ideal answers, track score over versions |
| **Agent vs Agent (red-team)** | Adversarial agent autonomously attacks the target agent |

---

## Key Insight

> Scripts test the **plumbing** — did the HTTP call go out, did the right tool get called.
> Only an **LLM judge** can test the **intelligence** — did it reason correctly, was it consistent, was it safe.

---

## Recommended Tech Stack

| Component | Tools |
|---|---|
| Orchestration | LangGraph, CrewAI |
| LLM backbone | Claude (strong at evaluation), GPT-4o |
| Evaluation | deepeval, ragas, custom LLM-as-judge |
| Tracing | Langfuse, LangSmith, Weights & Biases Weave |
| Storage | PostgreSQL or MongoDB (test run history) |

---

## Related Docs

- [Implementation Plan](./ai-agent-testing-implementation-plan.md)
- [Architecture Overview](./README.md)
- [System Patterns](./patterns.md)
