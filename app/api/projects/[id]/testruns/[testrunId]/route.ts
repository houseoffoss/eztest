import { testRunController } from '@/backend/controllers/testrun/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

export const GET = hasPermission(
  async (request, context) => {
    const { testrunId } = await context.params;
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '50');
    return testRunController.getTestRunById(testrunId, request.userInfo.id, page, limit);
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

