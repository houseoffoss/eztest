import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import {
  NotFoundException,
  InternalServerException,
} from "@/backend/utils/exceptions";
import { langfuseTraceService, type LangfuseTrace } from "./langfuse.service";
import { agentTestScoringService } from "./scoring.service";

export interface AgentTestRunSummary {
  runId: string;
  status: string;
  totalCases: number;
  completedCases: number;
  startedAt: Date;
  completedAt: Date | null;
  results: AgentTestResultSummary[];
}

export interface AgentTestResultSummary {
  id: string;
  testCaseId: string;
  sessionId: string;
  status: string;
  agentResponse: string | null;
  httpStatus: number | null;
  latencyMs: number | null;
  errorMessage: string | null;
  executedAt: Date;
  // Langfuse + scoring
  langfuseTraceId: string | null;
  traceFetchedAt: Date | null;
  traceFetchError: string | null;
  rubricScores: string | null;
  passCount: number | null;
  failCount: number | null;
  scoredAt: Date | null;
  scoreError: string | null;
  testCase: {
    title: string;
    category: string;
    input: string;
    expectedBehavior: string;
    rubric: string;
  };
}

export class AgentTestExecutionService {
  /**
   * Start a new test run: creates AgentTestRun + AgentTestResult rows (pending),
   * then fires-and-forgets the actual HTTP calls so the API responds immediately.
   */
  async startRun(
    configId: string,
    userId: string,
  ): Promise<AgentTestRunSummary> {
    // Verify config belongs to user — fetch Langfuse keys too
    const config = await prisma.agentTestConfig.findFirst({
      where: { id: configId, createdById: userId },
      select: {
        id: true,
        agentApiUrl: true,
        langfusePublicKey: true,
        langfuseSecretKey: true,
      },
    });

    if (!config) {
      throw new NotFoundException("Agent test configuration not found");
    }

    // Load all test cases for this config
    const testCases = await prisma.agentTestCase.findMany({
      where: { configId },
      orderBy: { generatedAt: "asc" },
    });

    if (testCases.length === 0) {
      throw new InternalServerException(
        "No test cases found. Generate test cases before running.",
      );
    }

    // Create the run record
    const run = await prisma.agentTestRun.create({
      data: {
        configId,
        createdById: userId,
        status: "running",
        totalCases: testCases.length,
        completedCases: 0,
      },
    });

    // Pre-create all result rows with unique session IDs (pending)
    const resultData = testCases.map((tc) => ({
      runId: run.id,
      testCaseId: tc.id,
      sessionId: randomUUID(),
      status: "pending" as const,
    }));

    await prisma.agentTestResult.createMany({ data: resultData });

    // Fetch the full result rows so we can return them and drive the async execution
    const results = await prisma.agentTestResult.findMany({
      where: { runId: run.id },
      include: {
        testCase: {
          select: {
            title: true,
            category: true,
            input: true,
            expectedBehavior: true,
            rubric: true,
          },
        },
      },
      orderBy: { executedAt: "asc" },
    });

    // Fire-and-forget: execute calls in the background
    this._executeAll(
      run.id,
      config.agentApiUrl,
      config.langfusePublicKey,
      config.langfuseSecretKey,
      testCases,
      resultData,
    ).catch((err) =>
      console.error("[AgentTestExecution] background execution failed:", err),
    );

    return {
      runId: run.id,
      status: run.status,
      totalCases: run.totalCases,
      completedCases: run.completedCases,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      results: results.map((r) => this._toSummary(r)),
    };
  }

  /**
   * Background worker: calls the agent API sequentially for each test case.
   *
   * For each test case:
   *   Step A — call the agent API, record response + latency
   *   Step B — wait 2 s, then fetch Langfuse trace by session_id (with retries)
   *   Step C — score the response + trace against the rubric with Claude
   *   Step D — persist all results, increment completedCases
   */
  private async _executeAll(
    runId: string,
    agentApiUrl: string,
    langfusePublicKey: string,
    langfuseSecretKey: string,
    testCases: { id: string; input: string; rubric: string }[],
    resultData: { runId: string; testCaseId: string; sessionId: string }[],
  ): Promise<void> {
    const sessionMap = new Map(
      resultData.map((r) => [r.testCaseId, r.sessionId]),
    );

    let completed = 0;

    for (const tc of testCases) {
      const sessionId = sessionMap.get(tc.id)!;

      // ── Step A: call the agent API ────────────────────────────────────────
      let agentResponse: string | null = null;
      let httpStatus: number | null = null;
      let latencyMs: number | null = null;
      let agentError: string | null = null;
      let agentOk = false;

      const t0 = Date.now();
      try {
        const response = await fetch(agentApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Session-Id": sessionId,
          },
          body: JSON.stringify({ message: tc.input, session_id: sessionId }),
          signal: AbortSignal.timeout(30_000),
        });

        latencyMs = Date.now() - t0;
        const rawBody = await response.text();

        httpStatus = response.status;
        agentResponse = rawBody.slice(0, 65_535);
        agentOk = response.ok;

        if (!response.ok) {
          agentError = `Agent returned HTTP ${response.status}`;
        }
      } catch (err: unknown) {
        latencyMs = Date.now() - t0;
        agentError =
          err instanceof Error
            ? err.message
            : "Unknown error during agent call";
        agentError = agentError.slice(0, 1_000);
      }

      // Persist agent call result immediately so polling reflects progress
      await prisma.agentTestResult.update({
        where: { sessionId },
        data: {
          status: agentOk ? "success" : "error",
          httpStatus,
          agentResponse,
          latencyMs,
          errorMessage: agentError,
        },
      });

      // ── Step B: fetch Langfuse trace ──────────────────────────────────────
      let trace: LangfuseTrace | null = null;
      let langfuseTraceId: string | null = null;
      let traceFetchError: string | null = null;

      try {
        trace = await langfuseTraceService.fetchTraceBySessionId(
          sessionId,
          langfusePublicKey,
          langfuseSecretKey,
        );
        langfuseTraceId = trace.id;
      } catch (err: unknown) {
        traceFetchError =
          err instanceof Error ? err.message : "Unknown Langfuse error";
        traceFetchError = traceFetchError.slice(0, 1_000);
      }

      await prisma.agentTestResult.update({
        where: { sessionId },
        data: {
          langfuseTraceId,
          traceJson: trace ? JSON.stringify(trace).slice(0, 65_535) : null,
          traceFetchedAt: new Date(),
          traceFetchError,
        },
      });

      // ── Step C: score the response against the rubric ─────────────────────
      let rubricScores: string | null = null;
      let passCount: number | null = null;
      let failCount: number | null = null;
      let scoreError: string | null = null;

      if (agentResponse && tc.rubric) {
        try {
          const result = await agentTestScoringService.score(
            tc.rubric,
            agentResponse,
            trace,
          );
          rubricScores = JSON.stringify(result.scores);
          passCount = result.passCount;
          failCount = result.failCount;
        } catch (err: unknown) {
          scoreError =
            err instanceof Error ? err.message : "Unknown scoring error";
          scoreError = scoreError.slice(0, 1_000);
        }
      }

      // ── Step D: persist scoring results ──────────────────────────────────
      await prisma.agentTestResult.update({
        where: { sessionId },
        data: {
          rubricScores,
          passCount,
          failCount,
          scoredAt: new Date(),
          scoreError,
        },
      });

      completed += 1;
      await prisma.agentTestRun.update({
        where: { id: runId },
        data: { completedCases: completed },
      });
    }

    // Mark run as completed
    await prisma.agentTestRun.update({
      where: { id: runId },
      data: { status: "completed", completedAt: new Date() },
    });
  }

  /**
   * Fetch + score a single existing result (manual re-score).
   * Used by the POST /api/agent-test-results/[id]/score endpoint.
   */
  async rescoreResult(resultId: string, userId: string): Promise<void> {
    const result = await prisma.agentTestResult.findFirst({
      where: { id: resultId, run: { createdById: userId } },
      include: {
        testCase: { select: { rubric: true } },
        run: {
          include: {
            config: {
              select: { langfusePublicKey: true, langfuseSecretKey: true },
            },
          },
        },
      },
    });

    if (!result) {
      throw new NotFoundException("Test result not found");
    }

    const { langfusePublicKey, langfuseSecretKey } = result.run.config;

    // Re-fetch trace
    let trace: LangfuseTrace | null = null;
    let langfuseTraceId: string | null = null;
    let traceFetchError: string | null = null;

    try {
      trace = await langfuseTraceService.fetchTraceBySessionId(
        result.sessionId,
        langfusePublicKey,
        langfuseSecretKey,
      );
      langfuseTraceId = trace.id;
    } catch (err: unknown) {
      traceFetchError =
        err instanceof Error ? err.message : "Unknown Langfuse error";
      traceFetchError = traceFetchError.slice(0, 1_000);
    }

    await prisma.agentTestResult.update({
      where: { id: resultId },
      data: {
        langfuseTraceId,
        traceJson: trace ? JSON.stringify(trace).slice(0, 65_535) : null,
        traceFetchedAt: new Date(),
        traceFetchError,
      },
    });

    // Re-score
    let rubricScores: string | null = null;
    let passCount: number | null = null;
    let failCount: number | null = null;
    let scoreError: string | null = null;

    if (result.agentResponse && result.testCase.rubric) {
      try {
        const scoring = await agentTestScoringService.score(
          result.testCase.rubric,
          result.agentResponse,
          trace,
        );
        rubricScores = JSON.stringify(scoring.scores);
        passCount = scoring.passCount;
        failCount = scoring.failCount;
      } catch (err: unknown) {
        scoreError =
          err instanceof Error ? err.message : "Unknown scoring error";
        scoreError = scoreError.slice(0, 1_000);
      }
    }

    await prisma.agentTestResult.update({
      where: { id: resultId },
      data: {
        rubricScores,
        passCount,
        failCount,
        scoredAt: new Date(),
        scoreError,
      },
    });
  }

  /**
   * Get the current state of a run (used for polling).
   */
  async getRun(runId: string, userId: string): Promise<AgentTestRunSummary> {
    const run = await prisma.agentTestRun.findFirst({
      where: { id: runId, createdById: userId },
      include: {
        results: {
          include: {
            testCase: {
              select: {
                title: true,
                category: true,
                input: true,
                expectedBehavior: true,
                rubric: true,
              },
            },
          },
          orderBy: { executedAt: "asc" },
        },
      },
    });

    if (!run) {
      throw new NotFoundException("Test run not found");
    }

    return {
      runId: run.id,
      status: run.status,
      totalCases: run.totalCases,
      completedCases: run.completedCases,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      results: run.results.map((r) => this._toSummary(r)),
    };
  }

  /**
   * List all runs for a config (latest first).
   */
  async listRuns(configId: string, userId: string) {
    const config = await prisma.agentTestConfig.findFirst({
      where: { id: configId, createdById: userId },
      select: { id: true },
    });

    if (!config) {
      throw new NotFoundException("Agent test configuration not found");
    }

    return prisma.agentTestRun.findMany({
      where: { configId },
      orderBy: { startedAt: "desc" },
      select: {
        id: true,
        status: true,
        totalCases: true,
        completedCases: true,
        startedAt: true,
        completedAt: true,
      },
    });
  }

  private _toSummary(r: {
    id: string;
    testCaseId: string;
    sessionId: string;
    status: string;
    agentResponse: string | null;
    httpStatus: number | null;
    latencyMs: number | null;
    errorMessage: string | null;
    executedAt: Date;
    langfuseTraceId: string | null;
    traceFetchedAt: Date | null;
    traceFetchError: string | null;
    rubricScores: string | null;
    passCount: number | null;
    failCount: number | null;
    scoredAt: Date | null;
    scoreError: string | null;
    testCase: {
      title: string;
      category: string;
      input: string;
      expectedBehavior: string;
      rubric: string;
    };
  }): AgentTestResultSummary {
    return {
      id: r.id,
      testCaseId: r.testCaseId,
      sessionId: r.sessionId,
      status: r.status,
      agentResponse: r.agentResponse,
      httpStatus: r.httpStatus,
      latencyMs: r.latencyMs,
      errorMessage: r.errorMessage,
      executedAt: r.executedAt,
      langfuseTraceId: r.langfuseTraceId,
      traceFetchedAt: r.traceFetchedAt,
      traceFetchError: r.traceFetchError,
      rubricScores: r.rubricScores,
      passCount: r.passCount,
      failCount: r.failCount,
      scoredAt: r.scoredAt,
      scoreError: r.scoreError,
      testCase: r.testCase,
    };
  }
}

export const agentTestExecutionService = new AgentTestExecutionService();
