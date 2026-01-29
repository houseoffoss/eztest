import { testRunController } from '@/backend/controllers/testrun/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

/**
 * POST /api/projects/[id]/testruns/[testrunId]/results
 * Add a test result to a test run
 */
export const POST = hasPermission(
  async (request, context) => {
    const { testrunId } = await context.params;
    const body = await request.json();
    return testRunController.addTestResult(body, testrunId, request.userInfo.id);
  },
  'testruns',
  'update'
);

