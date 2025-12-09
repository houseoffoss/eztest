import { testRunController } from '@/backend/controllers/testrun/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * POST /api/testruns/[id]/start
 * Start a test run
 * Required permission: testruns:update
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testRunController.startTestRun(id);
  },
  'testruns',
  'update'
);
