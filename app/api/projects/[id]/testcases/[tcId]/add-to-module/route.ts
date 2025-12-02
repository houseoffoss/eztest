import { testCaseController } from '@/backend/controllers/testcase/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * POST /api/projects/[id]/testcases/[tcId]/add-to-module
 * Add test case to a module
 * Required permission: testcases:update
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id: projectId, tcId } = await context.params;
    return testCaseController.addTestCaseToModule(request, projectId, tcId);
  },
  'testcases',
  'update'
);
