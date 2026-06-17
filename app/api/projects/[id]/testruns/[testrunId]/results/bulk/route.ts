import { testRunController } from '@/backend/controllers/testrun/controller';
import { hasProjectMemberAccess } from '@/lib/rbac/hasProjectMemberAccess';

export const PATCH = hasProjectMemberAccess(
  async (request, context) => {
    const { testrunId } = await context.params;
    const body = await request.json();
    return testRunController.bulkUpdateTestResults(body, testrunId, request.userInfo.id);
  },
  'testruns',
  'update'
);

export const DELETE = hasProjectMemberAccess(
  async (request, context) => {
    const { testrunId } = await context.params;
    const body = await request.json();
    return testRunController.bulkDeleteTestResults(body, testrunId, request.userInfo.role);
  },
  'testruns',
  'update'
);