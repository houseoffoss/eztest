import { testRunController } from '@/backend/controllers/testrun/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

/**
 * POST /api/projects/[id]/testruns/[testrunId]/reopen
 * Reopen a completed test run
 */
export const POST = hasPermission(
  async (request, context) => {
    const { testrunId } = await context.params;
    return testRunController.reopenTestRun(testrunId);
  },
  'testruns',
  'update'
);
