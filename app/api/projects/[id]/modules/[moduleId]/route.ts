import { moduleController } from '@/backend/controllers/module/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * GET /api/projects/[id]/modules/[moduleId]
 * Get a specific module with its test cases
 * Required permission: testcases:read
 */
export const GET = hasPermission(
  async (request, context) => {
    const { id: projectId, moduleId } = await context.params;
    return moduleController.getModuleById(request, projectId, moduleId);
  },
  'testcases',
  'read'
);

/**
 * PATCH /api/projects/[id]/modules/[moduleId]
 * Update a module
 * Required permission: testcases:update
 */
export const PATCH = hasPermission(
  async (request, context) => {
    const { id: projectId, moduleId } = await context.params;
    return moduleController.updateModule(request, projectId, moduleId);
  },
  'testcases',
  'update'
);

/**
 * DELETE /api/projects/[id]/modules/[moduleId]
 * Delete a module
 * Required permission: testcases:delete
 */
export const DELETE = hasPermission(
  async (request, context) => {
    const { id: projectId, moduleId } = await context.params;
    return moduleController.deleteModule(request, projectId, moduleId);
  },
  'testcases',
  'delete'
);
