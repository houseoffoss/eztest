import { testCaseController } from '@/backend/controllers/testcase/controller';
import { hasPermission } from '@/lib/auth';

export const PUT = hasPermission(
  async (request, { params }) => {
    const testCaseId = (await params).id;

    return testCaseController.updateTestSteps(
      request,
      testCaseId
    );
  },
  'tc', // test cases module
  'u'   // update permission
);
