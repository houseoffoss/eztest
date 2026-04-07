/**
 * AgentTestScoringService
 *
 * Scores an agent's response against the test case rubric using Claude.
 *
 * Each rubric is a pipe-separated list of pass/fail criteria, e.g.:
 *   "Calls get_order_status tool|Returns order details|Does not hallucinate status"
 *
 * For each criterion Claude returns:
 *   { criterion: string, pass: boolean, reason: string }
 *
 * The service also incorporates the Langfuse trace (tool calls, model usage,
 * latency) so the scorer can evaluate tool-use criteria accurately.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { LangfuseTrace } from "./langfuse.service";

const anthropic = new Anthropic();

export interface RubricScore {
  criterion: string;
  pass: boolean;
  reason: string;
}

export interface ScoringResult {
  scores: RubricScore[];
  passCount: number;
  failCount: number;
}

export class AgentTestScoringService {
  /**
   * Score a single test result against its rubric.
   *
   * @param rubric       Pipe-separated criteria string from AgentTestCase
   * @param agentResponse Raw response body from the agent API call
   * @param trace        Langfuse trace (may be null if fetch failed)
   */
  async score(
    rubric: string,
    agentResponse: string,
    trace: LangfuseTrace | null,
  ): Promise<ScoringResult> {
    const criteria = rubric
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);

    if (criteria.length === 0) {
      return { scores: [], passCount: 0, failCount: 0 };
    }

    const traceSection = trace
      ? this._buildTraceSummary(trace)
      : "(Langfuse trace unavailable)";

    const systemPrompt = `You are an objective AI test evaluator. You will be given:
1. An agent's raw API response
2. A Langfuse execution trace (tool calls, LLM generations, latency)
3. A list of pass/fail rubric criteria

For EACH criterion, output a JSON object with exactly these fields:
- "criterion": the exact criterion text (string)
- "pass": true if the criterion is met, false if not (boolean)
- "reason": one concise sentence explaining your decision (string)

Return a JSON array containing one object per criterion, in the same order as provided.
Do not include any text outside the JSON array.`;

    const userMessage = `## Agent Response
\`\`\`
${agentResponse.slice(0, 8_000)}
\`\`\`

## Langfuse Execution Trace
${traceSection}

## Rubric Criteria
${criteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Evaluate each criterion and return the JSON array.`;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const rawText =
      message.content[0]?.type === "text" ? message.content[0].text : "[]";

    const scores = this._parseScores(rawText, criteria);
    const passCount = scores.filter((s) => s.pass).length;
    const failCount = scores.filter((s) => !s.pass).length;

    return { scores, passCount, failCount };
  }

  /**
   * Build a compact trace summary for the scoring prompt.
   * Includes tool calls, generation outputs, and top-level latency.
   */
  private _buildTraceSummary(trace: LangfuseTrace): string {
    const lines: string[] = [];

    if (trace.latency != null) {
      lines.push(`Total latency: ${trace.latency}ms`);
    }

    // Match any SPAN that looks like a tool call: either named "*tool*" or
    // any SPAN with a non-null input (framework-specific span names like
    // "web_search", "get_order", "calculator" won't contain the word "tool").
    const toolCalls = (trace.observations ?? []).filter(
      (o) =>
        o.type === "SPAN" &&
        (o.input != null ||
          (typeof o.name === "string" &&
            o.name.toLowerCase().includes("tool"))),
    );

    if (toolCalls.length > 0) {
      lines.push(`\nTool calls (${toolCalls.length}):`);
      for (const t of toolCalls.slice(0, 10)) {
        const inputStr =
          t.input != null
            ? JSON.stringify(t.input).slice(0, 200)
            : "(no input)";
        const outputStr =
          t.output != null
            ? JSON.stringify(t.output).slice(0, 200)
            : "(no output)";
        lines.push(`  - ${t.name}: input=${inputStr} | output=${outputStr}`);
      }
    } else {
      lines.push("No tool calls recorded in trace.");
    }

    const generations = (trace.observations ?? []).filter(
      (o) => o.type === "GENERATION",
    );

    if (generations.length > 0) {
      lines.push(`\nLLM generations (${generations.length}):`);
      for (const g of generations.slice(0, 3)) {
        const outputStr =
          g.output != null
            ? JSON.stringify(g.output).slice(0, 300)
            : "(no output)";
        lines.push(`  - model=${g.model ?? "unknown"}: ${outputStr}`);
      }
    }

    if (trace.output != null) {
      lines.push(
        `\nTrace top-level output: ${JSON.stringify(trace.output).slice(0, 400)}`,
      );
    }

    return lines.join("\n") || "(empty trace)";
  }

  /**
   * Parse Claude's JSON response into RubricScore[].
   * Falls back gracefully if the response is malformed.
   */
  private _parseScores(raw: string, criteria: string[]): RubricScore[] {
    try {
      // Extract JSON array even if Claude wraps it in markdown fences
      const match = raw.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("No JSON array found");

      const parsed = JSON.parse(match[0]) as unknown[];

      return parsed.map((item, idx) => {
        if (
          typeof item === "object" &&
          item !== null &&
          "criterion" in item &&
          "pass" in item &&
          "reason" in item
        ) {
          const s = item as Record<string, unknown>;
          return {
            criterion: String(
              s.criterion ?? criteria[idx] ?? `Criterion ${idx + 1}`,
            ),
            pass: Boolean(s.pass),
            reason: String(s.reason ?? ""),
          };
        }
        return {
          criterion: criteria[idx] ?? `Criterion ${idx + 1}`,
          pass: false,
          reason: "Could not parse scorer output for this criterion.",
        };
      });
    } catch {
      // Return all-fail with an error reason so the result is still stored
      return criteria.map((c) => ({
        criterion: c,
        pass: false,
        reason: "Scorer returned unparseable output.",
      }));
    }
  }
}

export const agentTestScoringService = new AgentTestScoringService();
