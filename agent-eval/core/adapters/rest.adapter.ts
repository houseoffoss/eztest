import axios, { type AxiosError } from 'axios'
import type { IAgentAdapter, AdapterConfig, AdapterResponse, ConversationTurn } from './adapter.interface'

export class RestAdapter implements IAgentAdapter {
  async send(
    input: string | ConversationTurn[],
    config: AdapterConfig
  ): Promise<AdapterResponse> {
    const start = Date.now()
    const message = typeof input === 'string' ? input : input[input.length - 1]?.content ?? ''

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Session-Id': config.sessionId,
    }
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`
    }

    try {
      const response = await axios.post(
        config.endpoint,
        {
          message,
          session_id: config.sessionId,
          ...(Array.isArray(input) ? { history: input.slice(0, -1) } : {}),
        },
        {
          headers,
          timeout: config.timeoutMs ?? 30000,
        }
      )

      const responseData = response.data
      const content =
        typeof responseData === 'string'
          ? responseData
          : (responseData?.message ?? responseData?.response ?? responseData?.output ?? JSON.stringify(responseData))

      const responseHeaders: Record<string, string> = {}
      for (const [k, v] of Object.entries(response.headers)) {
        if (typeof v === 'string') responseHeaders[k] = v
      }

      return {
        content: String(content),
        latencyMs: Date.now() - start,
        statusCode: response.status,
        headers: responseHeaders,
        traceId: responseHeaders['x-langfuse-trace-id'] ?? responseHeaders['x-trace-id'],
      }
    } catch (err) {
      const axiosErr = err as AxiosError
      const statusCode = axiosErr.response?.status ?? 0
      throw Object.assign(new Error(`REST adapter error: ${axiosErr.message}`), {
        statusCode,
        latencyMs: Date.now() - start,
      })
    }
  }
}
