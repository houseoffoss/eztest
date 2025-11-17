import { testCaseController } from '@/backend/controllers/testcase/controller';
import { hasPermission } from '@/lib/rbac';

export const GET = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testCaseController.getTestCaseById(request, id);
  },
  'testcases',
  'read'
);

export const PUT = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testCaseController.updateTestCase(request, id);
  },
  'testcases',
  'update'
);

export const DELETE = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testCaseController.deleteTestCase(request, id);
  },
  'testcases',
  'delete'
);
