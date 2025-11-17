import { projectController } from '@/backend/controllers/project/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * GET /api/projects/[id]
 * Get project details with optional stats
 * Required permission: projects:read
 */
export const GET = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('stats') === 'true';
    
    return projectController.getProject(request, id, includeStats);
  },
  'projects',
  'read'
);

/**
 * PUT /api/projects/[id]
 * Update project information
 * Required permission: projects:update
 */
export const PUT = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    
    return projectController.updateProject(request, id);
  },
  'projects',
  'update'
);

/**
 * DELETE /api/projects/[id]
 * Delete a project
 * Required permission: projects:delete
 */
export const DELETE = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    
    return projectController.deleteProject(request, id);
  },
  'projects',
  'delete'
);
