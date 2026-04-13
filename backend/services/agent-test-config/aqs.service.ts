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
    const total = results.length;

    if (total === 0) {
      throw new NotFoundException("No results found for this run");
    }

    // All 5 dimensions use `total` (results.length) as the denominator.
    // A result that is missing data — because the agent errored, the AI scorer
    // hit a quota limit, or Langfuse was unreachable — contributes 0 to the
    // numerator. This is the only honest interpretation: if a test could not be
    // evaluated, it did not pass.

    // ── 1. Correctness ────────────────────────────────────────────────────────
    // Per-result score = passCount / (passCount + failCount), clamped to [0,1].
    // Results with no scoring data (scoreError, quota exhausted, etc.) = 0.
    let correctnessSum = 0;
    for (const r of results) {
      const pass = r.passCount ?? 0;
      const fail = r.failCount ?? 0;
      const criteria = pass + fail;
      // Only add a non-zero contribution if scoring actually ran
      if (criteria > 0) {
        correctnessSum += pass / criteria;
      }
      // else: scoring failed or never ran → contributes 0
    }
    const correctness = (correctnessSum / total) * 100;

    // ── 2. Tool Use ───────────────────────────────────────────────────────────
    // Fraction of ALL results (not just traced ones) where the agent made ≥1
    // tool call visible in the Langfuse trace.
    // Results with no trace (fetch failed, agent errored) = did not use tools.
    let toolUseCount = 0;
    for (const r of results) {
      if (!r.langfuseTraceId || !r.traceJson) continue;
      try {
        const trace = JSON.parse(r.traceJson) as {
          observations?: { type?: string; name?: string; input?: unknown }[];
        };
        const hasToolCall = (trace.observations ?? []).some(
          (o) =>
            o.type === "SPAN" &&
            (o.input != null ||
              (typeof o.name === "string" &&
                o.name.toLowerCase().includes("tool"))),
        );
        if (hasToolCall) toolUseCount += 1;
      } catch {
        // malformed trace JSON — treat as no tool call
      }
    }
    const toolUse = (toolUseCount / total) * 100;

    // ── 3. Latency ────────────────────────────────────────────────────────────
    // Per-result latency score mapped to [0,100] using the thresholds below.
    // Results with no latency data (network failure before any response) = 0.
    // Timeout results that recorded a latency >= LATENCY_POOR_MS also score 0.
    let latencySum = 0;
    for (const r of results) {
      if (r.latencyMs == null) {
        // No response received at all → worst score
        latencySum += 0;
        continue;
      }
      const ms = r.latencyMs;
      if (ms <= LATENCY_EXCELLENT_MS) {
        latencySum += 100;
      } else if (ms >= LATENCY_POOR_MS) {
        latencySum += 0;
      } else {
        latencySum +=
          100 *
          (1 -
            (ms - LATENCY_EXCELLENT_MS) /
              (LATENCY_POOR_MS - LATENCY_EXCELLENT_MS));
      }
    }
    const latency = latencySum / total;

    // ── 4. Error Rate ─────────────────────────────────────────────────────────
    // Fraction of results that returned a 2xx HTTP status.
    // Results with no HTTP status (network-level failure, no response) = failure.
    let httpSuccessCount = 0;
    for (const r of results) {
      const s = r.httpStatus;
      if (s != null && s >= 200 && s < 300) {
        httpSuccessCount += 1;
      }
      // null httpStatus (network failure) and non-2xx both count as 0
    }
    const errorRate = (httpSuccessCount / total) * 100;

    // ── 5. Trace Coverage ─────────────────────────────────────────────────────
    // Fraction of results with a successfully fetched Langfuse trace.
    const traceCoverage =
      (results.filter((r) => r.langfuseTraceId != null).length / total) * 100;

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
