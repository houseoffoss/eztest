/**
 * LangfuseTraceService
 *
 * Fetches a Langfuse trace by session_id using the Langfuse REST API.
 *
 * Langfuse API reference:
 *   GET /api/public/traces?sessionId={sessionId}
 *   Authorization: Basic base64(publicKey:secretKey)
 *
 * The agent embeds the session_id (UUID) in the trace when it calls Langfuse,
 * so we can correlate our AgentTestResult with the upstream trace.
 *
 * Retry strategy: up to MAX_ATTEMPTS with exponential back-off, because
 * Langfuse may ingest the trace a few seconds after the agent responds.
 */

const LANGFUSE_API_BASE = "https://cloud.langfuse.com";
const MAX_ATTEMPTS = 5;
const BASE_DELAY_MS = 2_000; // 2 s → 4 s → 8 s → 16 s → 32 s

export interface LangfuseTrace {
  id: string;
  sessionId: string | null;
  name: string | null;
  input: unknown;
  output: unknown;
  metadata: unknown;
  observations: LangfuseObservation[];
  scores: LangfuseScore[];
  latency: number | null;
  createdAt: string;
}

export interface LangfuseObservation {
  id: string;
  type: string; // "SPAN" | "GENERATION" | "EVENT"
  name: string | null;
  input: unknown;
  output: unknown;
  metadata: unknown;
  startTime: string;
  endTime: string | null;
  latency: number | null;
  model: string | null;
  usage: {
    input: number | null;
    output: number | null;
    total: number | null;
    unit: string | null;
  } | null;
}

export interface LangfuseScore {
  id: string;
  name: string;
  value: number;
  comment: string | null;
}

export class LangfuseTraceService {
  /**
   * Fetch the Langfuse trace associated with a session_id.
   *
   * Retries with exponential back-off because Langfuse ingests traces
   * asynchronously — the trace may not be available immediately after
   * the agent responds.
   *
   * Returns the first trace found for the session_id, or throws if not
   * found after all retries.
   */
  async fetchTraceBySessionId(
    sessionId: string,
    langfusePublicKey: string,
    langfuseSecretKey: string,
    langfuseBaseUrl: string = LANGFUSE_API_BASE,
  ): Promise<LangfuseTrace> {
    const authHeader =
      "Basic " +
      Buffer.from(`${langfusePublicKey}:${langfuseSecretKey}`).toString(
        "base64",
      );

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      // Wait before each attempt (no wait before the first)
      if (attempt > 1) {
        const delayMs = BASE_DELAY_MS * Math.pow(2, attempt - 2);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      try {
        // Step 1: list traces for this session
        const listUrl = new URL("/api/public/traces", langfuseBaseUrl);
        listUrl.searchParams.set("sessionId", sessionId);
        listUrl.searchParams.set("limit", "1");

        const listRes = await fetch(listUrl.toString(), {
          headers: { Authorization: authHeader },
          signal: AbortSignal.timeout(15_000),
        });

        if (!listRes.ok) {
          const body = await listRes.text();
          throw new Error(
            `Langfuse list-traces failed (${listRes.status}): ${body.slice(0, 300)}`,
          );
        }

        const listData = (await listRes.json()) as {
          data: { id: string }[];
          meta: { totalItems: number };
        };

        if (listData.data.length === 0) {
          // Trace not ingested yet — retry
          lastError = new Error(
            `No Langfuse trace found for session_id=${sessionId} (attempt ${attempt}/${MAX_ATTEMPTS})`,
          );
          continue;
        }

        const traceId = listData.data[0].id;

        // Step 2: fetch full trace detail (includes observations)
        const detailUrl = new URL(
          `/api/public/traces/${traceId}`,
          langfuseBaseUrl,
        );

        const detailRes = await fetch(detailUrl.toString(), {
          headers: { Authorization: authHeader },
          signal: AbortSignal.timeout(15_000),
        });

        if (!detailRes.ok) {
          const body = await detailRes.text();
          throw new Error(
            `Langfuse get-trace failed (${detailRes.status}): ${body.slice(0, 300)}`,
          );
        }

        const trace = (await detailRes.json()) as LangfuseTrace;
        return trace;
      } catch (err: unknown) {
        lastError =
          err instanceof Error
            ? err
            : new Error("Unknown Langfuse fetch error");

        // Hard errors (non-404/non-empty) — don't retry auth failures
        if (
          lastError.message.includes("(401)") ||
          lastError.message.includes("(403)")
        ) {
          throw lastError;
        }
      }
    }

    throw lastError ?? new Error("Langfuse trace fetch failed");
  }
}

export const langfuseTraceService = new LangfuseTraceService();
