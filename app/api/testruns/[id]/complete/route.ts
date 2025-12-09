import { testRunController } from '@/backend/controllers/testrun/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * POST /api/testruns/[id]/complete
 * Complete a test run
 * Required permission: testruns:update
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testRunController.completeTestRun(id);
  },
  'testruns',
  'update'
);
