import { testSuiteController } from '@/backend/controllers/testsuite/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

/**
 * POST /api/projects/[id]/testsuites/[suiteId]/testcases
 * Add test cases to a test suite
 */
export const POST = hasPermission(
  async (request, context) => {
    const { suiteId } = await context.params;
    return testSuiteController.addTestCasesToSuite(request, suiteId);
  },
  'testsuites',
  'update'
);

/**
 * DELETE /api/projects/[id]/testsuites/[suiteId]/testcases
 * Remove test cases from a test suite
 */
export const DELETE = hasPermission(
  async (request, context) => {
    const { suiteId } = await context.params;
    return testSuiteController.removeTestCasesFromSuite(request, suiteId);
  },
  'testsuites',
  'update'
);

