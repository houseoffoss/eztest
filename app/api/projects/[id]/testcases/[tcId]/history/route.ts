import { testCaseController } from '@/backend/controllers/testcase/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

/**
 * GET /api/projects/[id]/testcases/[tcId]/history
 * Get test case history (all test results across test runs)
 */
export const GET = hasPermission(
  async (request, context) => {
    const { tcId: testCaseId } = await context.params;
    return testCaseController.getTestCaseHistory(request, testCaseId);
  },
  'testcases',
  'read'
);

