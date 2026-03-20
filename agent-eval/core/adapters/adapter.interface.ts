export interface ConversationTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface AdapterConfig {
  endpoint: string
  apiKey?: string
  sessionId: string
  timeoutMs?: number
}

export interface AdapterResponse {
  content: string
  latencyMs: number
  statusCode: number
  headers: Record<string, string>
  traceId?: string  // Langfuse trace ID if returned in response headers
}

export interface IAgentAdapter {
  send(input: string | ConversationTurn[], config: AdapterConfig): Promise<AdapterResponse>
}
