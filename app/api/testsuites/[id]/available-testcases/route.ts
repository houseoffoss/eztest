import { testSuiteController } from '@/backend/controllers/testsuite/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * GET /api/testsuites/[id]/available-testcases
 * Get all modules with their available test cases (not already in this suite)
 * This is optimized to reduce multiple API calls
 * Required permission: testcases:read
 */
export const GET = hasPermission(
  async (request, context) => {
    const { id: suiteId } = await context!.params;
    return testSuiteController.getAvailableTestCases(suiteId);
  },
  'testcases',
  'read'
);
