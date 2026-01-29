import { testCaseController } from '@/backend/controllers/testcase/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

/**
 * PUT /api/projects/[id]/testcases/[tcId]/steps
 * Update test case steps
 */
export const PUT = hasPermission(
  async (request, context) => {
    const { tcId: testCaseId } = await context.params;
    return testCaseController.updateTestSteps(request, testCaseId);
  },
  'testcases',
  'update'
);

