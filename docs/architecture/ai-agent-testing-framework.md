# Autonomous AI Agent Testing Framework

> A true Agentic AI that autonomously evaluates any AI agent — it reasons, plans, acts, and adapts its own testing strategy from input to report with no fixed pipeline.

---

## Agentic Workflow vs Agentic AI

This is **not** an agentic workflow. Understanding the difference is critical.

| | Agentic Workflow | Agentic AI (this framework) |
|---|---|---|
| Flow | Fixed, predetermined steps | Agent decides every next step at runtime |
| Decision maker | The pipeline/orchestrator code | The LLM itself |
| When a test fails | Moves to next test | Reasons about *why*, generates follow-up test |
| Discovers new issue mid-run | Cannot — only runs what was planned | Probes deeper autonomously |
| Human review timing | Fixed gate in the pipeline | Agent decides when it's ready to ask |
| Stops when | Pipeline ends | Agent judges the goal is achieved |
| Can backtrack | No | Yes — re-runs a phase if new evidence warrants it |
| Handles surprises | No | Adapts plan based on what it discovers |

An agentic workflow is a pipeline where agents execute assigned tasks in a fixed sequence.
An Agentic AI is a goal-driven agent that **reasons → acts → observes → reasons** in a continuous loop, deciding its own next action based on what it has learned.

---

## Core Pattern — ReAct Loop

The framework is built on the **ReAct pattern** (Reasoning + Acting):

```
  GOAL: "Thoroughly evaluate this AI agent"
         │
         ▼
  ┌─────────────┐
  │    THINK    │  ← LLM reasons: "What do I know? What should I do next?"
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │     ACT     │  ← Calls a tool from its toolbox
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │   OBSERVE   │  ← Reads the tool result
  └──────┬──────┘
         │
         └──────────── loops back to THINK
                       until agent judges: "Goal achieved"
```

There is no fixed pipeline. The agent writes its own plan, executes it, and revises it based on what it finds.

---

## Agent Toolbox

The master agent has one set of tools it can call in any order, any number of times:

```
Master Agentic AI
    │
    ├── parse_repo(url, branch?)
    │     → extracts system prompt, tools, entry point, docs from Git repo
    │
    ├── introspect_agent(endpoint, system_prompt?)
    │     → probes the agent with open-ended queries to understand its domain
    │
    ├── generate_test_cases(spec, focus, count)
    │     → produces test cases for a specific category or focus area
    │
    ├── generate_test_script(test_case)
    │     → produces the execution plan: input sequence, expected tool calls,
    │       expected output criteria, invariants
    │
    ├── request_human_review(tests, reason)
    │     → pauses execution, surfaces tests + scripts for human approval
    │       agent calls this when IT judges review is needed — not on a fixed schedule
    │
    ├── execute_test(test_script)
    │     → fires the test at the target agent, captures full response + trace
    │
    ├── evaluate_result(result, criteria)
    │     → LLM judge scores the result across 6 dimensions
    │
    ├── run_followup_test(failure_context, focus)
    │     → generates and runs an additional targeted test based on a failure
    │
    ├── detect_pattern(results)
    │     → identifies recurring failure types across all results so far
    │
    └── generate_report(run_summary)
          → produces the final structured report
```

---

## End-to-End Flow

```
┌─────────────────────────────────────────────────────────┐
│                        INPUT                            │
│                                                         │
│   Option A — API / Manual                               │
│   ├── Target agent's API endpoint                       │
│   ├── System prompt / tool schema                       │
│   └── (Optional) golden dataset or eval config         │
│                                                         │
│   Option B — Git Repository                             │
│   ├── Repo URL (GitHub, GitLab, etc.)                   │
│   └── (Optional) branch / commit ref                   │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              MASTER AGENTIC AI                          │
│   Goal: "Thoroughly evaluate this AI agent"             │
│                                                         │
│   Runs a continuous ReAct loop:                         │
│   THINK → ACT (call tool) → OBSERVE → THINK → ...      │
│                                                         │
│   ┌───────────────────────────────────────────────┐    │
│   │  PHASE: UNDERSTAND                            │    │
│   │  Calls: parse_repo / introspect_agent         │    │
│   │  Goal: know what the target agent does        │    │
│   └───────────────────────────────────────────────┘    │
│                        │                                │
│                        ▼                                │
│   ┌───────────────────────────────────────────────┐    │
│   │  PHASE: PLAN & GENERATE                       │    │
│   │  Calls: generate_test_cases (multiple times   │    │
│   │         with different focus areas)           │    │
│   │  Calls: generate_test_script per case         │    │
│   │  Agent decides: how many tests, which         │    │
│   │  categories, what invariants to define        │    │
│   └───────────────────────────────────────────────┘    │
│                        │                                │
│                        ▼                                │
│   ┌───────────────────────────────────────────────┐    │
│   │  PHASE: HUMAN REVIEW (agent-initiated)        │    │
│   │  Calls: request_human_review(tests, reason)   │    │
│   │  Agent decides WHEN to ask — not a fixed gate │    │
│   │                                               │    │
│   │  Human actions:                               │    │
│   │  ├── Approve All → agent proceeds             │    │
│   │  ├── Approve with edits → agent incorporates  │    │
│   │  ├── Reject with feedback → agent regenerates │    │
│   │  └── Delete individual tests → agent removes  │    │
│   └───────────────────────────────────────────────┘    │
│                        │                                │
│                        ▼                                │
│   ┌───────────────────────────────────────────────┐    │
│   │  PHASE: EXECUTE & ADAPT                       │    │
│   │  Calls: execute_test per approved test        │    │
│   │  Calls: evaluate_result immediately after     │    │
│   │                                               │    │
│   │  Agent reasons after each result:             │    │
│   │  ├── "Pass — move on"                         │    │
│   │  ├── "Fail — is this a known pattern?"        │    │
│   │  ├── "Fail — new failure mode, probe deeper"  │    │
│   │  │     → calls run_followup_test              │    │
│   │  └── "Pattern detected across N tests"        │    │
│   │        → calls detect_pattern                 │    │
│   └───────────────────────────────────────────────┘    │
│                        │                                │
│                        ▼                                │
│   ┌───────────────────────────────────────────────┐    │
│   │  PHASE: REPORT                                │    │
│   │  Agent decides when enough evidence exists    │    │
│   │  Calls: generate_report(run_summary)          │    │
│   └───────────────────────────────────────────────┘    │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                 EVALUATION SCORING                      │
│   (embedded in evaluate_result tool)                    │
│                                                         │
│   6 dimensions — scored per test:                       │
│   ├── Factual Accuracy       LLM judge    0–10  (25%)   │
│   ├── Tool Use Correctness   Exact match  P/F   (20%)   │
│   ├── Instruction Following  Rubric       0–10  (20%)   │
│   ├── Safety / Refusals      Classifier   P/F   (15%)   │
│   ├── Consistency            Embedding    0–10  (10%)   │
│   └── Latency                Threshold    P/F   (10%)   │
│                                                         │
│   Composite Score = weighted average (max 10.0)         │
│   Verdict: PASS / FAIL / CRITICAL FAIL / BLOCKED / ERROR│
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    END RESULT                           │
│   ├── Per-test score card (6 dimension breakdown)       │
│   ├── Category scores (Happy Path, Adversarial, etc.)   │
│   ├── Run composite score + verdict band                │
│   ├── Failure patterns with agent reasoning             │
│   ├── Regression diff vs previous run                   │
│   ├── LLM-generated improvement suggestions             │
│   └── Output: Markdown / HTML / JSON / PDF              │
└─────────────────────────────────────────────────────────┘
```

---

## How a Real Run Behaves

```
Agent receives: GitHub repo URL

THINK  "I need to understand this agent first."
ACT    parse_repo(url)
OBS    "Customer support bot. Tools: search_kb, escalate_ticket,
        send_email, lookup_order. Recent commits touched escalation logic."

THINK  "Escalation logic was recently changed — high regression risk.
        I'll generate routing tests with focus on escalation, plus happy path."
ACT    generate_test_cases(spec, focus="tool_routing", count=10)
ACT    generate_test_cases(spec, focus="happy_path", count=5)
ACT    generate_test_cases(spec, focus="adversarial", count=8)

THINK  "Adversarial tests could be risky. I should ask for human review
        before running those. Happy path I can run immediately."
ACT    request_human_review(adversarial_tests, reason="contains prompt injection tests")
OBS    Human approved with feedback: "remove test #4, increase escalation coverage"

ACT    generate_test_cases(spec, focus="escalation", count=3)   ← agent adapts to feedback

THINK  "Running happy path first for baseline."
ACT    execute_test + evaluate_result  (×5, happy path)
OBS    "4/5 passed. Test #3 failed — agent called send_email instead of
        escalate_ticket for urgent priority query."

THINK  "Interesting. This could be a routing boundary issue specific to
        urgency signals. I should probe this before continuing."
ACT    generate_test_cases(spec, focus="urgency_signal_routing", count=4)
ACT    execute_test + evaluate_result  (×4)
OBS    "3/4 failed the same way. Pattern confirmed."
ACT    detect_pattern(results)

THINK  "Root cause identified. Continuing with remaining tests."
ACT    execute_test + evaluate_result  (×remaining)
ACT    generate_report(run_summary)

THINK  "Goal achieved. Report complete."
DONE
```

The agent found a bug, probed it autonomously, confirmed the pattern — all without being told to.

---

## Trace Visibility Strategies

How deeply the agent can inspect the target depends on access level:

| Strategy | When to use | What agent can see |
|---|---|---|
| **Shared Langfuse credentials** | You own the agent | Full trace — every span, tool call, latency per step |
| **Proxy layer** | Any agent, no code changes | All outgoing LLM + tool calls intercepted at network level |
| **SDK wrapper** | Git repo + Docker spin-up | Native trace access — agent runs inside framework's process |
| **Black-box** | Third-party, no access | Input/output only — LLM judge evaluates final response |

---

## Evaluation Score Card

Every test produces a score card:

| Dimension | Method | Weight |
|---|---|---|
| Factual Accuracy | LLM judge vs expected criteria | 25% |
| Tool Use Correctness | Exact match on tool name + params | 20% |
| Instruction Following | Rubric-based LLM scoring | 20% |
| Safety / Refusals | Classifier | 15% |
| Consistency | Embedding similarity across turns | 10% |
| Latency | Hard threshold | 10% |

**Score bands:**
- `≥ 9.0` — Excellent
- `7.0–8.9` — Good (default pass threshold)
- `5.0–6.9` — Needs improvement
- `< 5.0` — Poor

**Verdicts:** `PASS` / `FAIL` / `CRITICAL FAIL` / `BLOCKED` / `ERROR`

---

## Testing Approaches the Agent Uses

| Approach | What it does |
|---|---|
| **LLM-as-judge** | Separate AI scores the output quality |
| **Behavioral contracts** | Invariants the agent must never violate |
| **Conversation simulation** | Synthetic multi-turn dialogues (10–20 turns) |
| **Perturbation testing** | Rephrase input slightly, check reasoning consistency |
| **Golden dataset evals** | Compare against ideal answers, track score over versions |
| **Adversarial red-teaming** | Prompt injection, jailbreak, role confusion |
| **Follow-up probing** | Agent generates new tests on-the-fly when a failure is found |

---

## Recommended Tech Stack

| Component | Tools |
|---|---|
| Agent framework | LangGraph (ReAct loop), Claude claude-sonnet-4-6 |
| LLM judge | Claude claude-opus-4-6 (stronger reasoning for evaluation) |
| Evaluation library | deepeval, ragas |
| Tracing | Langfuse, LangSmith |
| Storage | PostgreSQL + Prisma |
| Adapters | REST, Anthropic SDK, OpenAI SDK, LangChain |

---

## Related Docs

- [Scope of Work](./ai-agent-testing-scope-of-work.md)
- [Implementation Plan](./ai-agent-testing-implementation-plan.md)
- [Architecture Overview](./README.md)
