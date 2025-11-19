import { testCaseController } from '@/backend/controllers/testcase/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

export const PUT = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testCaseController.updateTestSteps(request, id);
  },
  'testcases',
  'update'
);
