import { testCaseController } from '@/backend/controllers/testcase/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

export const GET = hasPermission(
  async (request, context) => {
    const { tcId } = await context.params;
    return testCaseController.getTestCaseById(request, tcId);
  },
  'testcases',
  'read'
);

export const PUT = hasPermission(
  async (request, context) => {
    const { tcId } = await context.params;
    return testCaseController.updateTestCase(request, tcId);
  },
  'testcases',
  'update'
);

export const DELETE = hasPermission(
  async (request, context) => {
    const { tcId } = await context.params;
    return testCaseController.deleteTestCase(request, tcId);
  },
  'testcases',
  'delete'
);

