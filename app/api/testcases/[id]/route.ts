import { testCaseController } from '@/backend/controllers/testcase/controller';
import { hasPermission } from '@/lib/auth';

export const GET = hasPermission(
  async (request, { params }) => {
    const testCaseId = (await params).id;

    return testCaseController.getTestCaseById(
      request,
      testCaseId
    );
  },
  'tc', // test cases module
  'r'   // read permission
);

export const PUT = hasPermission(
  async (request, { params }) => {
    const testCaseId = (await params).id;

    return testCaseController.updateTestCase(
      request,
      testCaseId
    );
  },
  'tc', // test cases module
  'u'   // update permission
);

export const DELETE = hasPermission(
  async (request, { params }) => {
    const testCaseId = (await params).id;

    return testCaseController.deleteTestCase(
      request,
      testCaseId
    );
  },
  'tc', // test cases module
  'd'   // delete permission
);
