import type { ITraceStrategy, TraceData } from './trace.interface'

// Black-box strategy: no trace access — input/output only
export class BlackboxStrategy implements ITraceStrategy {
  async getTrace(_sessionId: string, _window: { before: Date; after: Date }): Promise<TraceData | null> {
    return null
  }
}
