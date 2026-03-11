import { testCaseController } from '@/backend/controllers/testcase/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

/**
 * @route GET /api/projects/:id/testcases/filter-options
 * @desc Get distinct domain and functionName values for filter dropdowns
 * @access Private - Project member with read access
 */
export const GET = hasPermission(
  async (request, context) => {
    const { id: projectId } = await context.params;
    return testCaseController.getTestCaseFilterOptions(request, projectId);
  },
  'testcases',
  'read'
);
