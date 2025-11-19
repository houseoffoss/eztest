import { testCaseController } from '@/backend/controllers/testcase/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

export const GET = hasPermission(
  async (request, context) => {
    const { id: projectId } = await context.params;
    return testCaseController.getProjectTestCases(request, projectId);
  },
  'testcases',
  'read'
);

export const POST = hasPermission(
  async (request, context) => {
    const { id: projectId } = await context.params;
    return testCaseController.createTestCase(request, projectId);
  },
  'testcases',
  'create'
);
