import { healthController } from '@/backend/controllers/health/controller';

/**
 * GET /api/health
 * Health check endpoint
 */
export async function GET() {
  try {
    const result = await healthController.getHealth();
    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        data: null,
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 503 }
    );
  }
}
