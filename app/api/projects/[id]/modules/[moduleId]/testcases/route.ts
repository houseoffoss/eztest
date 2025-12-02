import { moduleController } from '@/backend/controllers/module/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * GET /api/projects/[id]/modules/[moduleId]/testcases
 * Get all test cases for a specific module
 * Required permission: testcases:read
 */
export const GET = hasPermission(
  async (request, context) => {
    const { id: projectId, moduleId } = await context.params;
    return moduleController.getModuleTestCases(request, projectId, moduleId);
  },
  'testcases',
  'read'
);
