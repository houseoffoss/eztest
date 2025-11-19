import { testSuiteController } from '@/backend/controllers/testsuite/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * POST /api/testsuites/move
 * Move test cases to a suite (or remove from suite if suiteId is null)
 * Required permission: testcases:update
 */
export const POST = hasPermission(
  async (request) => {
    return testSuiteController.moveTestCasesToSuite(request, request.userInfo.id);
  },
  'testcases',
  'update'
);
