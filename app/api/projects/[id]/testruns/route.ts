import { testRunController } from '@/backend/controllers/testrun/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * GET /api/projects/[id]/testruns
 * Get all test runs for a project
 * Required permission: testruns:read
 */
export const GET = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    
    // Get query parameters for filters
    const searchParams = new URL(request.url).searchParams;
    const filters = {
      status: searchParams.get('status') || undefined,
      assignedToId: searchParams.get('assignedToId') || undefined,
      environment: searchParams.get('environment') || undefined,
      search: searchParams.get('search') || undefined,
    };

    return testRunController.getProjectTestRuns(
      id,
      request.userInfo.id,
      filters as never
    );
  },
  'testruns',
  'read'
);

/**
 * POST /api/projects/[id]/testruns
 * Create a new test run for a project
 * Required permission: testruns:create
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testRunController.createTestRun(request, id, request.userInfo.id);
  },
  'testruns',
  'create'
);
