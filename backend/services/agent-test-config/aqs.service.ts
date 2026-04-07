/**
 * AgentTestAqsService
 *
 * Computes the Agent Quality Score (AQS) for a completed test run.
 *
 * AQS is a composite 0-100 score built from 5 dimensions:
 *
 * 1. Correctness     (40%) — rubric pass rate across all scored results
 * 2. Tool Use        (20%) — fraction of results that have ≥1 tool call in trace
 * 3. Latency         (15%) — speed score: 100 if median ≤ 1 s, 0 if median ≥ 10 s
 * 4. Error Rate      (15%) — inverted HTTP error rate (2xx = success)
 * 5. Trace Coverage  (10%) — fraction of results with a Langfuse trace
 *
 * Regression delta = current aqsScore − previous completed run's aqsScore.
 * If no prior run exists, delta is null.
 */

import { prisma } from "@/lib/prisma";
import { NotFoundException } from "@/backend/utils/exceptions";
import type { RubricScore } from "./scoring.service";

export interface AqsDimensions {
  correctness: number; // 0-100
  toolUse: number; // 0-100
  latency: number; // 0-100
  errorRate: number; // 0-100
  traceCoverage: number; // 0-100
}

export interface AqsResult {
  score: number; // 0-100 composite
  dimensions: AqsDimensions;
  regressionDelta: number | null;
  computedAt: Date;
}

// Dimension weights — must sum to 1
const WEIGHTS = {
  correctness: 0.4,
  toolUse: 0.2,
  latency: 0.15,
  errorRate: 0.15,
  traceCoverage: 0.1,
} as const;

// Latency thresholds (ms)
const LATENCY_EXCELLENT_MS = 1_000; // 100 score
const LATENCY_POOR_MS = 10_000; // 0 score

export class AgentTestAqsService {
  /**
   * Compute (or re-compute) AQS for the given run, persist it, and return it.
   * The run must belong to userId.
   */
  async computeAndPersist(runId: string, userId: string): Promise<AqsResult> {
    const run = await prisma.agentTestRun.findFirst({
      where: { id: runId, createdById: userId },
      include: {
        results: {
          select: {
            status: true,
            httpStatus: true,
            latencyMs: true,
            rubricScores: true,
            passCount: true,
            failCount: true,
            langfuseTraceId: true,
            traceJson: true,
          },
        },
      },
    });

    if (!run) {
      throw new NotFoundException("Test run not found");
    }

    const results = run.results;

    // ── 1. Correctness ────────────────────────────────────────────────────────
    // Fraction of rubric criteria that passed, averaged across all scored results.
    const scored = results.filter(
      (r) => r.passCount != null && r.failCount != null,
    );
    let correctness = 0;
    if (scored.length > 0) {
      const totalCriteria = scored.reduce(
        (sum, r) => sum + (r.passCount ?? 0) + (r.failCount ?? 0),
        0,
      );
      const totalPass = scored.reduce((sum, r) => sum + (r.passCount ?? 0), 0);
      correctness = totalCriteria > 0 ? (totalPass / totalCriteria) * 100 : 0;
    }

    // ── 2. Tool Use ───────────────────────────────────────────────────────────
    // Fraction of results where the agent made ≥1 tool call (visible in trace).
    const withTrace = results.filter((r) => r.langfuseTraceId != null);
    let toolUse = 0;
    if (withTrace.length > 0) {
      const withToolCalls = withTrace.filter((r) => {
        if (!r.traceJson) return false;
        try {
          const trace = JSON.parse(r.traceJson) as {
            observations?: { type?: string; name?: string }[];
          };
          // Same broadened detection as scoring.service: any SPAN with a
          // non-null input is treated as a tool call, since agents often
          // name their tool spans after the tool itself ("web_search",
          // "get_order") rather than using a generic "tool_call" name.
          return (trace.observations ?? []).some(
            (o) =>
              o.type === "SPAN" &&
              (o.input != null ||
                (typeof o.name === "string" &&
                  o.name.toLowerCase().includes("tool"))),
          );
        } catch {
          return false;
        }
      });
      toolUse = (withToolCalls.length / withTrace.length) * 100;
    }

    // ── 3. Latency ────────────────────────────────────────────────────────────
    // Score based on median latency across successful results.
    const latencies = results
      .filter((r) => r.latencyMs != null && r.status === "success")
      .map((r) => r.latencyMs as number)
      .sort((a, b) => a - b);

    let latency = 0;
    if (latencies.length > 0) {
      const mid = Math.floor(latencies.length / 2);
      const median =
        latencies.length % 2 === 0
          ? (latencies[mid - 1] + latencies[mid]) / 2
          : latencies[mid];

      if (median <= LATENCY_EXCELLENT_MS) {
        latency = 100;
      } else if (median >= LATENCY_POOR_MS) {
        latency = 0;
      } else {
        // Linear interpolation between excellent and poor
        latency =
          100 *
          (1 -
            (median - LATENCY_EXCELLENT_MS) /
              (LATENCY_POOR_MS - LATENCY_EXCELLENT_MS));
      }
    }

    // ── 4. Error Rate ─────────────────────────────────────────────────────────
    // 100 − (fraction of non-2xx responses × 100).
    // Only results that actually received an HTTP status are counted.
    const withHttp = results.filter((r) => r.httpStatus != null);
    let errorRate = 100; // assume perfect if no HTTP data
    if (withHttp.length > 0) {
      const errors = withHttp.filter(
        (r) =>
          (r.httpStatus as number) < 200 || (r.httpStatus as number) >= 300,
      );
      errorRate = 100 - (errors.length / withHttp.length) * 100;
    }

    // ── 5. Trace Coverage ─────────────────────────────────────────────────────
    // Fraction of results for which a Langfuse trace was successfully fetched.
    const traceCoverage =
      results.length > 0
        ? (results.filter((r) => r.langfuseTraceId != null).length /
            results.length) *
          100
        : 0;

    // ── Composite AQS ─────────────────────────────────────────────────────────
    const score =
      correctness * WEIGHTS.correctness +
      toolUse * WEIGHTS.toolUse +
      latency * WEIGHTS.latency +
      errorRate * WEIGHTS.errorRate +
      traceCoverage * WEIGHTS.traceCoverage;

    const roundedScore = Math.round(score * 10) / 10;
    const dimensions: AqsDimensions = {
      correctness: Math.round(correctness * 10) / 10,
      toolUse: Math.round(toolUse * 10) / 10,
      latency: Math.round(latency * 10) / 10,
      errorRate: Math.round(errorRate * 10) / 10,
      traceCoverage: Math.round(traceCoverage * 10) / 10,
    };

    // ── Regression Delta ──────────────────────────────────────────────────────
    // Find the most recent previously completed run for this config (≠ current run).
    const previousRun = await prisma.agentTestRun.findFirst({
      where: {
        configId: run.configId,
        status: "completed",
        id: { not: runId },
        aqsScore: { not: null },
        completedAt: { lt: run.startedAt },
      },
      orderBy: { completedAt: "desc" },
      select: { aqsScore: true },
    });

    const regressionDelta =
      previousRun?.aqsScore != null
        ? Math.round((roundedScore - previousRun.aqsScore) * 10) / 10
        : null;

    const computedAt = new Date();

    // Persist to database
    await prisma.agentTestRun.update({
      where: { id: runId },
      data: {
        aqsScore: roundedScore,
        aqsCorrectness: dimensions.correctness,
        aqsToolUse: dimensions.toolUse,
        aqsLatency: dimensions.latency,
        aqsErrorRate: dimensions.errorRate,
        aqsTraceCoverage: dimensions.traceCoverage,
        aqsComputedAt: computedAt,
        aqsRegressionDelta: regressionDelta,
      },
    });

    return {
      score: roundedScore,
      dimensions,
      regressionDelta,
      computedAt,
    };
  }

  /**
   * Return the already-computed AQS for a run without re-computing.
   * Returns null if AQS has not been computed yet.
   */
  async getForRun(runId: string, userId: string): Promise<AqsResult | null> {
    const run = await prisma.agentTestRun.findFirst({
      where: { id: runId, createdById: userId },
      select: {
        aqsScore: true,
        aqsCorrectness: true,
        aqsToolUse: true,
        aqsLatency: true,
        aqsErrorRate: true,
        aqsTraceCoverage: true,
        aqsComputedAt: true,
        aqsRegressionDelta: true,
      },
    });

    if (!run) {
      throw new NotFoundException("Test run not found");
    }

    if (run.aqsScore == null || run.aqsComputedAt == null) {
      return null;
    }

    return {
      score: run.aqsScore,
      dimensions: {
        correctness: run.aqsCorrectness ?? 0,
        toolUse: run.aqsToolUse ?? 0,
        latency: run.aqsLatency ?? 0,
        errorRate: run.aqsErrorRate ?? 0,
        traceCoverage: run.aqsTraceCoverage ?? 0,
      },
      regressionDelta: run.aqsRegressionDelta ?? null,
      computedAt: run.aqsComputedAt,
    };
  }
}

export const agentTestAqsService = new AgentTestAqsService();
