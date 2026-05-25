import { prisma } from "@/lib/prisma";
import { createId } from "@paralleldrive/cuid2";
import {
  NotFoundException,
  InternalServerException,
} from "@/backend/utils/exceptions";
import { langfuseTraceService, type LangfuseTrace } from "./langfuse.service";
import { agentTestScoringService } from "./scoring.service";
import { agentTestAqsService } from "./aqs.service";
import type { ApiContract } from "./generation.service";
import type { AgentTestCaseTurn } from "@/types/agent-testing";
import { getEnvDefaults } from "@/lib/ai-provider";

export interface AgentTestRunSummary {
  runId: string;
  configId: string;
  configName: string;
  agentApiUrl: string;
  status: string;
  totalCases: number;
  completedCases: number;
  startedAt: Date;
  completedAt: Date | null;
  results: AgentTestResultSummary[];
  // AQS
  aqsScore: number | null;
  aqsCorrectness: number | null;
  aqsToolUse: number | null;
  aqsLatency: number | null;
  aqsErrorRate: number | null;
  aqsTraceCoverage: number | null;
  aqsComputedAt: Date | null;
  aqsRegressionDelta: number | null;
}

export interface AgentTestResultSummary {
  id: string;
  testCaseId: string;
  sessionId: string;
  status: string;
  requestPayload: string | null;
  agentResponse: string | null;
  httpStatus: number | null;
  latencyMs: number | null;
  errorMessage: string | null;
  executedAt: Date;
  // Langfuse + scoring
  langfuseTraceId: string | null;
  traceJson: string | null;
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
    dimension: string | null;
    input: string;
    expectedBehavior: string;
    rubric: string;
    turns: string | null;
  };
}


export class AgentTestExecutionService {
  /**
   * Prepare a new test run: creates AgentTestRun + AgentTestResult rows (pending).
   * Returns the summary AND the execution promise so the caller can register it
   * with Next.js `after()` to keep it alive after the response is sent.
   */
  async prepareRun(
    configId: string,
    userId: string,
  ): Promise<{
    summary: AgentTestRunSummary;
    executionPromise: Promise<void>;
  }> {
    // Verify config belongs to user — fetch Langfuse keys too
    const config = await prisma.agentTestConfig.findFirst({
      where: { id: configId, createdById: userId },
      select: {
        id: true,
        name: true,
        agentApiUrl: true,
        langfusePublicKey: true,
        langfuseSecretKey: true,
        apiContract: true,
        aiProvider: true,
        aiModel: true,
        aiApiKey: true,
        cookies: true,
        authHeaders: true,
        testMode: true,
        multiTurnSessionId: true,
      },
    });

    if (!config) {
      throw new NotFoundException("Agent test configuration not found");
    }

    // Load all test cases for this config
    const testCases = await prisma.agentTestCase.findMany({
      where: { configId },
      orderBy: { generatedAt: "asc" },
      select: { id: true, category: true, input: true, rubric: true, turns: true },
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

    // Pre-create all result rows with session IDs (pending)
    // Session assignment respects testMode and multi-turn category:
    // - testMode: "multi_turn" + category: "multi_turn" → use config.multiTurnSessionId
    // - testMode: "single_turn" → always fresh sessionId
    // - testMode: "both" + category: "multi_turn" → use config.multiTurnSessionId; others → fresh
    const resultData = testCases.map((tc) => {
      const useMultiTurnSession =
        (config.testMode === "both" || config.testMode === "multi_turn") &&
        tc.category === "multi_turn" &&
        config.multiTurnSessionId;

      return {
        runId: run.id,
        testCaseId: tc.id,
        sessionId: useMultiTurnSession ? config.multiTurnSessionId! : createId(),
        status: "pending" as const,
      };
    });

    await prisma.agentTestResult.createMany({ data: resultData });

    // Fetch the full result rows so we can return them
    const results = await prisma.agentTestResult.findMany({
      where: { runId: run.id },
      include: {
        testCase: {
          select: {
            title: true,
            category: true,
            dimension: true,
            input: true,
            expectedBehavior: true,
            rubric: true,
            turns: true,
          },
        },
      },
      orderBy: { executedAt: "asc" },
    });

    const summary: AgentTestRunSummary = {
      runId: run.id,
      configId: config.id,
      configName: config.name,
      agentApiUrl: config.agentApiUrl,
      status: run.status,
      totalCases: run.totalCases,
      completedCases: run.completedCases,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      results: results.map((r) => this._toSummary(r)),
      aqsScore: null,
      aqsCorrectness: null,
      aqsToolUse: null,
      aqsLatency: null,
      aqsErrorRate: null,
      aqsTraceCoverage: null,
      aqsComputedAt: null,
      aqsRegressionDelta: null,
    };

    // Build a map from testCaseId → result DB id for stable lookups in _executeAll
    const resultIdMap = new Map(results.map((r) => [r.testCaseId, r.id]));

    const apiContract: ApiContract | null = config.apiContract
      ? (JSON.parse(config.apiContract) as ApiContract)
      : null;

    const envDefaults = getEnvDefaults();
    const cookies = config.cookies
      ? (JSON.parse(config.cookies) as Array<{ name: string; value: string }>)
      : [];
    const authHeaders = config.authHeaders
      ? (JSON.parse(config.authHeaders) as Record<string, string>)
      : {};
    const executionPromise = this._executeAll(
      run.id,
      config.agentApiUrl,
      config.langfusePublicKey,
      config.langfuseSecretKey,
      apiContract,
      cookies,
      authHeaders,
      testCases,
      resultData,
      resultIdMap,
      (config.aiProvider ?? envDefaults.provider) as "anthropic" | "google",
      config.aiApiKey ?? envDefaults.apiKey,
      config.aiModel ?? envDefaults.model,
    ).catch((err) =>
      console.error("[AgentTestExecution] background execution failed:", err),
    );

    return { summary, executionPromise };
  }

  /** @deprecated Use prepareRun instead */
  async startRun(
    configId: string,
    userId: string,
  ): Promise<AgentTestRunSummary> {
    const { summary } = await this.prepareRun(configId, userId);
    return summary;
  }

  /**
   * Background worker: calls the agent API sequentially for each test case.
   *
   * For each test case:
   *   Step A — call the agent API, record response + latency
   *             • On timeout: retry twice (max 3 attempts total)
   *             • On network fetch failure: increment consecutive-failure counter;
   *               if counter reaches 3, abort the entire run
   *   Step B — wait 2 s, then fetch Langfuse trace by session_id (with retries)
   *   Step C — score the response + trace against the rubric with Claude
   *   Step D — persist all results, increment completedCases
   */
  private async _executeAll(
    runId: string,
    agentApiUrl: string,
    langfusePublicKey: string,
    langfuseSecretKey: string,
    apiContract: ApiContract | null,
    cookies: Array<{ name: string; value: string }> = [],
    authHeaders: Record<string, string> = {},
    testCases: { id: string; category: string; input: string; rubric: string; turns: string | null }[],
    resultData: { runId: string; testCaseId: string; sessionId: string }[],
    resultIdMap: Map<string, string>,
    aiProvider: "anthropic" | "google" = "anthropic",
    aiApiKey?: string,
    aiModel?: string,
  ): Promise<void> {
    const sessionMap = new Map(
      resultData.map((r) => [r.testCaseId, r.sessionId]),
    );

    let completed = 0;
    /** Tracks consecutive network-level fetch failures (resets on any success). */
    let consecutiveFetchFailures = 0;
    const MAX_CONSECUTIVE_FETCH_FAILURES = 3;

    for (const tc of testCases) {
      const sessionId = sessionMap.get(tc.id)!;
      const resultId = resultIdMap.get(tc.id)!;

      const isMultiTurn = tc.category === "multi_turn" && tc.turns != null;

      if (isMultiTurn) {
        const fetchFailureDelta = await this._executeMultiTurn({
          resultId,
          sessionId,
          tc: { id: tc.id, input: tc.input, rubric: tc.rubric, turns: tc.turns! },
          agentApiUrl,
          apiContract,
          cookies,
          authHeaders,
          langfusePublicKey,
          langfuseSecretKey,
          aiProvider,
          aiApiKey,
          aiModel,
        });
        consecutiveFetchFailures += fetchFailureDelta;
      } else {
        const fetchFailureDelta = await this._executeSingleTurn({
          resultId,
          sessionId,
          tc: { id: tc.id, input: tc.input, rubric: tc.rubric },
          agentApiUrl,
          apiContract,
          cookies,
          authHeaders,
          langfusePublicKey,
          langfuseSecretKey,
          aiProvider,
          aiApiKey,
          aiModel,
        });
        consecutiveFetchFailures += fetchFailureDelta;
      }

      // If we've hit 3+ consecutive network failures, abort the run
      if (consecutiveFetchFailures >= MAX_CONSECUTIVE_FETCH_FAILURES) {
        console.error(
          `[AgentTestExecution] Run ${runId} aborted: ${consecutiveFetchFailures} consecutive fetch failures.`,
        );
        await prisma.agentTestRun.update({
          where: { id: runId },
          data: { status: "failed", completedAt: new Date() },
        });
        return;
      }

      completed += 1;
      await prisma.agentTestRun.update({
        where: { id: runId },
        data: { completedCases: completed },
      });
    }

    // Mark run as completed
    const completedRun = await prisma.agentTestRun.update({
      where: { id: runId },
      data: { status: "completed", completedAt: new Date() },
      select: { createdById: true },
    });

    // ── Step 5: compute AQS ───────────────────────────────────────────────────
    try {
      await agentTestAqsService.computeAndPersist(
        runId,
        completedRun.createdById,
      );
    } catch (err: unknown) {
      console.error("[AgentTestExecution] AQS computation failed:", err);
      // Non-fatal — run result is still stored; AQS can be re-triggered via API
    }
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
              select: {
                langfusePublicKey: true,
                langfuseSecretKey: true,
                aiProvider: true,
                aiModel: true,
                aiApiKey: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      throw new NotFoundException("Test result not found");
    }

    const {
      langfusePublicKey,
      langfuseSecretKey,
      aiProvider,
      aiModel,
      aiApiKey,
    } = result.run.config;
    const rescoreEnvDefaults = getEnvDefaults();

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
          (aiProvider ?? rescoreEnvDefaults.provider) as "anthropic" | "google",
          aiApiKey ?? rescoreEnvDefaults.apiKey,
          aiModel ?? rescoreEnvDefaults.model,
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

  // ─── Shared call params type ─────────────────────────────────────────────
  private _buildChatUrl(agentApiUrl: string, apiContract: ApiContract | null) {
    const base = agentApiUrl.replace(/\/+$/, "");
    const chatPath = apiContract?.chatPath ?? "/api/chat";
    return { base, chatUrl: base + chatPath };
  }

  private _buildRequestBody(
    apiContract: ApiContract | null,
    userMessage: string,
    agentSessionId: string,
  ) {
    return apiContract?.requestBody
      ? Object.fromEntries(
          Object.entries(apiContract.requestBody).map(([k, v]) => [
            k,
            v === "{{input}}"
              ? userMessage
              : v === "{{sessionId}}"
                ? agentSessionId
                : v,
          ]),
        )
      : { message: userMessage, sessionId: agentSessionId };
  }

  private _buildHeaders(
    apiContract: ApiContract | null,
    authHeaders: Record<string, string>,
    agentSessionId: string,
    cookies: Array<{ name: string; value: string }>,
  ): Record<string, string> {
    const extraHeaders: Record<string, string> = apiContract?.headers ?? {};
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Session-Id": agentSessionId,
      ...extraHeaders,
      ...authHeaders,
    };
    if (cookies.length > 0) {
      headers.Cookie = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    }
    return headers;
  }

  /** Make one HTTP POST to the agent, with retry on timeout. Returns { agentOk, httpStatus, latencyMs, agentResponse, agentError, fetchFailed } */
  private async _callAgent(
    chatUrl: string,
    headers: Record<string, string>,
    requestBody: Record<string, unknown>,
  ): Promise<{
    agentOk: boolean;
    httpStatus: number | null;
    latencyMs: number | null;
    agentResponse: string | null;
    agentError: string | null;
    fetchFailed: boolean;
  }> {
    const MAX_ATTEMPTS = 3;
    let agentOk = false;
    let httpStatus: number | null = null;
    let latencyMs: number | null = null;
    let agentResponse: string | null = null;
    let agentError: string | null = null;
    let fetchFailed = false;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const t0 = Date.now();
      try {
        const response = await fetch(chatUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(90_000),
        });
        latencyMs = Date.now() - t0;
        const rawBody = await response.text();
        httpStatus = response.status;
        agentResponse = rawBody.slice(0, 65_535);
        agentOk = response.ok;
        if (!response.ok) agentError = `Agent returned HTTP ${response.status}`;
        break;
      } catch (err: unknown) {
        latencyMs = Date.now() - t0;
        const isTimeout =
          err instanceof Error &&
          (err.name === "TimeoutError" || err.name === "AbortError");
        if (isTimeout && attempt < MAX_ATTEMPTS) {
          agentError = null;
          agentOk = false;
          continue;
        }
        agentError = err instanceof Error ? err.message : "Unknown error during agent call";
        agentError = agentError.slice(0, 1_000);
        if (!isTimeout) fetchFailed = true;
        break;
      }
    }
    return { agentOk, httpStatus, latencyMs, agentResponse, agentError, fetchFailed };
  }

  /**
   * Execute a single-turn test case.
   * Returns the number of consecutive fetch failures to add to the run counter (0 or 1).
   */
  private async _executeSingleTurn(params: {
    resultId: string;
    sessionId: string;
    tc: { id: string; input: string; rubric: string };
    agentApiUrl: string;
    apiContract: ApiContract | null;
    cookies: Array<{ name: string; value: string }>;
    authHeaders: Record<string, string>;
    langfusePublicKey: string;
    langfuseSecretKey: string;
    aiProvider: "anthropic" | "google";
    aiApiKey?: string;
    aiModel?: string;
  }): Promise<number> {
    const { resultId, sessionId, tc, agentApiUrl, apiContract, cookies, authHeaders,
      langfusePublicKey, langfuseSecretKey, aiProvider, aiApiKey, aiModel } = params;

    const { base, chatUrl } = this._buildChatUrl(agentApiUrl, apiContract);
    const sessionStartPath = apiContract?.sessionStartPath ?? null;

    let agentSessionId = sessionId;
    if (sessionStartPath) {
      try {
        const sessionRes = await fetch(base + sessionStartPath, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          signal: AbortSignal.timeout(30_000),
        });
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData?.sessionId) agentSessionId = sessionData.sessionId;
        }
      } catch { /* Non-fatal — fall back to our own sessionId */ }
    }

    console.log("[AgentTestExecution] authHeaders keys:", Object.keys(authHeaders), "| has Authorization:", !!authHeaders.Authorization);

    const requestBody = this._buildRequestBody(apiContract, tc.input, agentSessionId);
    const headers = this._buildHeaders(apiContract, authHeaders, agentSessionId, cookies);
    const { agentOk, httpStatus, latencyMs, agentResponse, agentError, fetchFailed } =
      await this._callAgent(chatUrl, headers, requestBody);

    await prisma.agentTestResult.update({
      where: { sessionId },
      data: {
        sessionId: agentSessionId,
        status: agentOk ? "success" : "error",
        httpStatus,
        requestPayload: JSON.stringify({ url: chatUrl, body: requestBody }),
        agentResponse,
        latencyMs,
        errorMessage: agentError,
      },
    });

    // Step B: Langfuse trace
    let trace: LangfuseTrace | null = null;
    let langfuseTraceId: string | null = null;
    let traceFetchError: string | null = null;
    try {
      trace = await langfuseTraceService.fetchTraceBySessionId(agentSessionId, langfusePublicKey, langfuseSecretKey);
      langfuseTraceId = trace.id;
    } catch (err: unknown) {
      traceFetchError = (err instanceof Error ? err.message : "Unknown Langfuse error").slice(0, 1_000);
    }
    await prisma.agentTestResult.update({
      where: { id: resultId },
      data: { langfuseTraceId, traceJson: trace ? JSON.stringify(trace).slice(0, 65_535) : null, traceFetchedAt: new Date(), traceFetchError },
    });

    // Step C: Score
    let rubricScores: string | null = null;
    let passCount: number | null = null;
    let failCount: number | null = null;
    let scoreError: string | null = null;
    if (agentResponse && tc.rubric) {
      try {
        const result = await agentTestScoringService.score(tc.rubric, agentResponse, trace, aiProvider, aiApiKey, aiModel);
        rubricScores = JSON.stringify(result.scores);
        passCount = result.passCount;
        failCount = result.failCount;
      } catch (err: unknown) {
        scoreError = (err instanceof Error ? err.message : "Unknown scoring error").slice(0, 1_000);
      }
    }
    await prisma.agentTestResult.update({
      where: { id: resultId },
      data: { rubricScores, passCount, failCount, scoredAt: new Date(), scoreError },
    });

    return fetchFailed ? 1 : 0;
  }

  /**
   * Execute a multi-turn test case: sends Turn 1 (tc.input) then each subsequent
   * turn from the parsed turns array using the same session. Turn 1 is not scored;
   * turns 2+ are each scored against their individual rubric criteria.
   * Returns the number of consecutive fetch failures to add to the run counter (0 or 1).
   */
  private async _executeMultiTurn(params: {
    resultId: string; // kept for API consistency with _executeSingleTurn; not used internally
    sessionId: string;
    tc: { id: string; input: string; rubric: string; turns: string };
    agentApiUrl: string;
    apiContract: ApiContract | null;
    cookies: Array<{ name: string; value: string }>;
    authHeaders: Record<string, string>;
    langfusePublicKey: string;
    langfuseSecretKey: string;
    aiProvider: "anthropic" | "google";
    aiApiKey?: string;
    aiModel?: string;
  }): Promise<number> {
    const { sessionId, tc, agentApiUrl, apiContract, cookies, authHeaders,
      langfusePublicKey, langfuseSecretKey, aiProvider, aiApiKey, aiModel } = params;

    const { base, chatUrl } = this._buildChatUrl(agentApiUrl, apiContract);
    const sessionStartPath = apiContract?.sessionStartPath ?? null;

    let agentSessionId = sessionId;
    if (sessionStartPath) {
      try {
        const sessionRes = await fetch(base + sessionStartPath, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          signal: AbortSignal.timeout(30_000),
        });
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData?.sessionId) agentSessionId = sessionData.sessionId;
        }
      } catch { /* Non-fatal */ }
    }

    let parsedTurns: AgentTestCaseTurn[] = [];
    try {
      parsedTurns = JSON.parse(tc.turns) as AgentTestCaseTurn[];
    } catch {
      parsedTurns = [];
    }

    // Build ordered list: Turn 1 (no rubric) + subsequent turns
    const allTurns: Array<{ turnNumber: number; userMessage: string; rubric: string }> = [
      { turnNumber: 1, userMessage: tc.input, rubric: "" },
      ...parsedTurns.map((t) => ({ turnNumber: t.turnNumber, userMessage: t.userMessage, rubric: t.rubric })),
    ];

    interface TurnExecResult {
      turn: number;
      userMessage: string;
      httpStatus: number | null;
      latencyMs: number | null;
      response: string | null;
      requestUrl: string;
      requestBody: Record<string, unknown>;
      errorMessage: string | null;
    }
    interface TurnScore {
      turn: number;
      scores: { criterion: string; pass: boolean; reason: string }[];
      passCount: number;
      failCount: number;
    }

    const turnResults: TurnExecResult[] = [];
    const turnScores: TurnScore[] = [];
    let totalPassCount = 0;
    let totalFailCount = 0;
    let totalLatencyMs = 0;
    let finalHttpStatus: number | null = null;
    let overallOk = true;
    let fetchFailed = false;
    let lastAgentResponse: string | null = null;
    let lastTrace: LangfuseTrace | null = null;

    for (const turn of allTurns) {
      const requestBody = this._buildRequestBody(apiContract, turn.userMessage, agentSessionId);
      const headers = this._buildHeaders(apiContract, authHeaders, agentSessionId, cookies);
      const { agentOk, httpStatus, latencyMs, agentResponse, agentError, fetchFailed: turnFetchFailed } =
        await this._callAgent(chatUrl, headers, requestBody);

      turnResults.push({
        turn: turn.turnNumber,
        userMessage: turn.userMessage,
        httpStatus,
        latencyMs,
        response: agentResponse,
        requestUrl: chatUrl,
        requestBody,
        errorMessage: agentError,
      });

      totalLatencyMs += latencyMs ?? 0;
      finalHttpStatus = httpStatus;
      if (!agentOk) overallOk = false;
      if (turnFetchFailed) { fetchFailed = true; break; }
      lastAgentResponse = agentResponse;

      // Score turns 2+ only (turn 1 establishes context, not scored)
      if (turn.turnNumber > 1 && agentResponse && turn.rubric) {
        try {
          const result = await agentTestScoringService.score(turn.rubric, agentResponse, null, aiProvider, aiApiKey, aiModel);
          turnScores.push({ turn: turn.turnNumber, scores: result.scores, passCount: result.passCount, failCount: result.failCount });
          totalPassCount += result.passCount;
          totalFailCount += result.failCount;
        } catch { /* score error handled below via scoreError */ }
      }
    }

    // Fetch Langfuse trace using final session ID (last turn's trace)
    let langfuseTraceId: string | null = null;
    let traceFetchError: string | null = null;
    try {
      lastTrace = await langfuseTraceService.fetchTraceBySessionId(agentSessionId, langfusePublicKey, langfuseSecretKey);
      langfuseTraceId = lastTrace.id;
    } catch (err: unknown) {
      traceFetchError = (err instanceof Error ? err.message : "Unknown Langfuse error").slice(0, 1_000);
    }

    // Persist everything — store per-turn arrays in requestPayload / agentResponse / rubricScores
    await prisma.agentTestResult.update({
      where: { sessionId },
      data: {
        sessionId: agentSessionId,
        status: overallOk ? "success" : "error",
        httpStatus: finalHttpStatus,
        latencyMs: totalLatencyMs,
        requestPayload: JSON.stringify(turnResults.map((t) => ({ turn: t.turn, url: t.requestUrl, body: t.requestBody }))).slice(0, 65_535),
        agentResponse: JSON.stringify(turnResults.map((t) => ({ turn: t.turn, userMessage: t.userMessage, response: t.response }))).slice(0, 65_535),
        errorMessage: overallOk ? null : (turnResults.find((t) => t.errorMessage)?.errorMessage ?? null),
        langfuseTraceId,
        traceJson: lastTrace ? JSON.stringify(lastTrace).slice(0, 65_535) : null,
        traceFetchedAt: new Date(),
        traceFetchError,
        rubricScores: JSON.stringify(turnScores),
        passCount: totalPassCount,
        failCount: totalFailCount,
        scoredAt: new Date(),
        scoreError: null,
      },
    });

    void lastAgentResponse; // used implicitly via turnResults

    return fetchFailed ? 1 : 0;
  }

  /**
   * Get the current state of a run (used for polling and results dashboard).
   */
  async getRun(runId: string, userId: string): Promise<AgentTestRunSummary> {
    const run = await prisma.agentTestRun.findFirst({
      where: { id: runId, createdById: userId },
      include: {
        config: { select: { id: true, name: true, agentApiUrl: true } },
        results: {
          include: {
            testCase: {
              select: {
                title: true,
                category: true,
                dimension: true,
                input: true,
                expectedBehavior: true,
                rubric: true,
                turns: true,
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
      configId: run.configId,
      configName: run.config.name,
      agentApiUrl: run.config.agentApiUrl,
      status: run.status,
      totalCases: run.totalCases,
      completedCases: run.completedCases,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      results: run.results.map((r) => this._toSummary(r)),
      aqsScore: run.aqsScore,
      aqsCorrectness: run.aqsCorrectness,
      aqsToolUse: run.aqsToolUse,
      aqsLatency: run.aqsLatency,
      aqsErrorRate: run.aqsErrorRate,
      aqsTraceCoverage: run.aqsTraceCoverage,
      aqsComputedAt: run.aqsComputedAt,
      aqsRegressionDelta: run.aqsRegressionDelta,
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
    requestPayload: string | null;
    agentResponse: string | null;
    httpStatus: number | null;
    latencyMs: number | null;
    errorMessage: string | null;
    executedAt: Date;
    langfuseTraceId: string | null;
    traceJson: string | null;
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
      dimension: string | null;
      input: string;
      expectedBehavior: string;
      rubric: string;
      turns: string | null;
    };
  }): AgentTestResultSummary {
    return {
      id: r.id,
      testCaseId: r.testCaseId,
      sessionId: r.sessionId,
      status: r.status,
      requestPayload: r.requestPayload,
      agentResponse: r.agentResponse,
      httpStatus: r.httpStatus,
      latencyMs: r.latencyMs,
      errorMessage: r.errorMessage,
      executedAt: r.executedAt,
      langfuseTraceId: r.langfuseTraceId,
      traceJson: r.traceJson,
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
