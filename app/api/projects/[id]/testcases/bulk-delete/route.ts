import { testCaseController } from '@/backend/controllers/testcase/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

/**
 * POST /api/projects/[id]/testcases/bulk-delete
 * Bulk delete test cases
 * Required permission: testcases:delete
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id: projectId } = await context.params;
    const body = await request.json();
    return testCaseController.bulkDeleteTestCases(request, projectId, body);
  },
  'testcases',
  'delete'
);
