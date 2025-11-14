import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { testRunController } from '@/backend/controllers/testrun/controller';

/**
 * GET /api/projects/[id]/testruns
 * Get all test runs for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest();

  if (auth.error) {
    return auth.error;
  }

  const { id } = await params;

  // Get query parameters for filters
  const searchParams = request.nextUrl.searchParams;
  const filters = {
    status: searchParams.get('status') || undefined,
    assignedToId: searchParams.get('assignedToId') || undefined,
    environment: searchParams.get('environment') || undefined,
    search: searchParams.get('search') || undefined,
  };

  return testRunController.getProjectTestRuns(
    id,
    auth.session.user.id,
    auth.session.user.role,
    filters as never
  );
}

/**
 * POST /api/projects/[id]/testruns
 * Create a new test run for a project
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest();

  if (auth.error) {
    return auth.error;
  }

  const { id } = await params;

  return testRunController.createTestRun(
    request,
    id,
    auth.session.user.id,
    auth.session.user.role
  );
}
