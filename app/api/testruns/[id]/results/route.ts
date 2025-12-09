import { testRunController } from '@/backend/controllers/testrun/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * POST /api/testruns/[id]/results
 * Add a test result to a test run
 * Required permission: testruns:update
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    const body = await request.json();
    return testRunController.addTestResult(body, id, request.userInfo.id);
  },
  'testruns',
  'update'
);
