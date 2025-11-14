import { NextRequest, NextResponse } from 'next/server';

export type BaseApiMethod<T extends NextRequest = NextRequest> = (
  request: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<any>;

// Define logger interface for global object
interface GlobalWithLogger {
  logger?: {
    error: (data: { message: string; err: Error | unknown; statusCode: number }) => void;
  };
}

export function baseInterceptor<T extends NextRequest>(
  apiMethod: BaseApiMethod<T>
): BaseApiMethod<T> {
  return async (request, context) => {
    try {
      const response = await apiMethod(request, context);

      if (response instanceof NextResponse) {
        return response;
      }

      return NextResponse.json(response, { status: 200 });
    } catch (err: unknown) {
      const error = err as { message?: string; statusCode?: number; data?: unknown };
      // Log error if logger is available
      const globalWithLogger = globalThis as unknown as GlobalWithLogger;
      if (globalWithLogger.logger) {
        globalWithLogger.logger.error({
          message: error.message || 'Unknown error',
          err: err,
          statusCode: error.statusCode || 500
        });
      } else {
        console.error('Error:', err);
      }

      if (error.statusCode === 422) {
        return NextResponse.json(
          { message: error.message, data: error.data },
          { status: error.statusCode }
        );
      } else if (error.statusCode) {
        return NextResponse.json(
          { message: error.message, data: error.data || null },
          { status: error.statusCode }
        );
      } else {
        return NextResponse.json(
          { message: error.message || 'Something went wrong' },
          { status: 500 }
        );
      }
    }
  };
}
