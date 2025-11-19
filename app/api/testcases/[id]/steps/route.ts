import { testCaseController } from '@/backend/controllers/testcase/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

export const PUT = hasPermission(
  async (request, context) => {
    const testCaseId = context.params.id;
    return testCaseController.updateTestSteps(request, testCaseId);
  },
  'testcases',
  'update'
);
