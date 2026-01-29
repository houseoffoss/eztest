import { testSuiteController } from '@/backend/controllers/testsuite/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

export const GET = hasPermission(
  async (request, context) => {
    const { suiteId } = await context.params;
    return testSuiteController.getTestSuiteById(suiteId, request.userInfo.id);
  },
  'testsuites',
  'read'
);

export const PUT = hasPermission(
  async (request, context) => {
    const { suiteId } = await context.params;
    return testSuiteController.updateTestSuite(request, suiteId, request.userInfo.id);
  },
  'testsuites',
  'update'
);

export const PATCH = hasPermission(
  async (request, context) => {
    const { suiteId } = await context.params;
    return testSuiteController.updateTestSuite(request, suiteId, request.userInfo.id);
  },
  'testsuites',
  'update'
);

export const DELETE = hasPermission(
  async (request, context) => {
    const { suiteId } = await context.params;
    return testSuiteController.deleteTestSuite(suiteId, request.userInfo.id);
  },
  'testsuites',
  'delete'
);

