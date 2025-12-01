import { moduleController } from '@/backend/controllers/module/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * POST /api/projects/[id]/modules/reorder
 * Reorder modules within a project
 * Required permission: testcases:update
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id: projectId } = await context.params;
    return moduleController.reorderModules(request, projectId);
  },
  'testcases',
  'update'
);
