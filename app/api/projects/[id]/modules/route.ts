import { moduleController } from '@/backend/controllers/module/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * GET /api/projects/[id]/modules
 * Get all modules for a project
 * Required permission: testcases:read
 */
export const GET = hasPermission(
  async (request, context) => {
    const { id: projectId } = await context.params;
    return moduleController.getProjectModules(request, projectId);
  },
  'testcases',
  'read'
);

/**
 * POST /api/projects/[id]/modules
 * Create a new module
 * Required permission: testcases:create
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id: projectId } = await context.params;
    return moduleController.createModule(request, projectId);
  },
  'testcases',
  'create'
);
