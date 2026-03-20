import { Langfuse } from 'langfuse'
import type { ITraceStrategy, TraceData, TraceSpan } from './trace.interface'
import type { LangfuseConfig } from '../input/agent-spec.types'

const POLL_ATTEMPTS = 3
const POLL_DELAY_MS = 1500

export class LangfuseStrategy implements ITraceStrategy {
  private client: Langfuse

  constructor(config: LangfuseConfig) {
    this.client = new Langfuse({
      publicKey: config.publicKey,
      secretKey: config.secretKey,
      baseUrl: config.host ?? 'https://cloud.langfuse.com',
    })
  }

  async getTrace(
    sessionId: string,
    _window: { before: Date; after: Date }
  ): Promise<TraceData | null> {
    // Wait for Langfuse ingestion before first poll
    await sleep(POLL_DELAY_MS)

    for (let attempt = 1; attempt <= POLL_ATTEMPTS; attempt++) {
      try {
        const result = await this.client.fetchTraces({ sessionId, limit: 1 })
        const trace = result.data[0]

        if (!trace) {
          if (attempt < POLL_ATTEMPTS) {
            console.log(`[langfuse] Trace not found for session ${sessionId}, retrying (${attempt}/${POLL_ATTEMPTS})...`)
            await sleep(attempt * 1000)
            continue
          }
          console.warn(`[langfuse] No trace found for session ${sessionId} after ${POLL_ATTEMPTS} attempts`)
          return null
        }

        // Fetch observations (spans) for this trace
        const observations = await this.client.fetchObservations({ traceId: trace.id })
        const spans: TraceSpan[] = observations.data.map(obs => ({
          name: obs.name ?? 'unknown',
          input: obs.input,
          output: obs.output,
          latencyMs: obs.latency ?? undefined,
          model: (obs as { model?: string }).model ?? undefined,
          toolName: obs.name?.startsWith('tool.') ? obs.name.replace('tool.', '') : undefined,
        }))

        const toolCallsMade = spans
          .filter(s => s.toolName)
          .map(s => ({ name: s.toolName!, params: s.input }))

        return {
          traceId: trace.id,
          sessionId,
          spans,
          totalLatencyMs: trace.latency ?? undefined,
          toolCallsMade,
        }
      } catch (err) {
        console.warn(`[langfuse] Error fetching trace (attempt ${attempt}):`, err)
        if (attempt < POLL_ATTEMPTS) await sleep(attempt * 1000)
      }
    }

    return null
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
