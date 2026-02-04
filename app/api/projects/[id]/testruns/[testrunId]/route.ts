import { testRunController } from '@/backend/controllers/testrun/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

export const GET = hasPermission(
  async (request, context) => {
    const { testrunId } = await context.params;
    return testRunController.getTestRunById(testrunId, request.userInfo.id);
  },
  'testruns',
  'read'
);

export const PUT = hasPermission(
  async (request, context) => {
    const { testrunId } = await context.params;
    const body = await request.json();
    return testRunController.updateTestRun(body, testrunId);
  },
  'testruns',
  'update'
);

export const DELETE = hasPermission(
  async (request, context) => {
    const { testrunId } = await context.params;
    return testRunController.deleteTestRun(testrunId);
  },
  'testruns',
  'delete'
);

