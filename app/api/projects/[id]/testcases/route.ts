import { testCaseController } from '@/backend/controllers/testcase/controller';
import { hasPermission } from '@/lib/auth';

export const GET = hasPermission(
  async (request, { params }) => {
    const projectId = (await params).id;

    return testCaseController.getProjectTestCases(
      request,
      projectId
    );
  },
  'tc', // test cases module
  'r'   // read permission
);

export const POST = hasPermission(
  async (request, { params }) => {
    const projectId = (await params).id;

    return testCaseController.createTestCase(
      request,
      projectId
    );
  },
  'tc', // test cases module
  'w'   // write permission
);
