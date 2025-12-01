import { testCaseController } from '@/backend/controllers/testcase/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * GET /api/testcases/[id]/history
 * Get test case history (all test results across test runs)
 * Required permission: testcases:read
 */
export const GET = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testCaseController.getTestCaseHistory(request, id);
  },
  'testcases',
  'read'
);
