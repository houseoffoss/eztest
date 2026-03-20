export interface TraceSpan {
  name: string
  input?: unknown
  output?: unknown
  latencyMs?: number
  model?: string
  toolName?: string
}

export interface TraceData {
  traceId: string
  sessionId: string
  spans: TraceSpan[]
  totalLatencyMs?: number
  toolCallsMade: Array<{ name: string; params: unknown }>
}

export interface ITraceStrategy {
  getTrace(sessionId: string, window: { before: Date; after: Date }): Promise<TraceData | null>
}
