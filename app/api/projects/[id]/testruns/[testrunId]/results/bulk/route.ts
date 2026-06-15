import { testRunController } from '@/backend/controllers/testrun/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

export const PATCH = hasPermission(
  async (request, context) => {
    const { testrunId } = await context.params;
    const body = await request.json();
    return testRunController.bulkUpdateTestResults(body, testrunId, request.userInfo.id);
  },
  'testruns',
  'update'
);

export const DELETE = hasPermission(
  async (request, context) => {
    const { testrunId } = await context.params;
    const body = await request.json();
    return testRunController.bulkDeleteTestResults(body, testrunId);
  },
  'testruns',
  'update'
);