import { testSuiteController } from '@/backend/controllers/testsuite/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

/**
 * GET /api/projects/[id]/testsuites/[suiteId]/available-testcases
 * Get available test cases for a test suite
 */
export const GET = hasPermission(
  async (request, context) => {
    const { suiteId } = await context.params;
    return testSuiteController.getAvailableTestCases(suiteId);
  },
  'testsuites',
  'read'
);

