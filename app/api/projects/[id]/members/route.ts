import { projectController } from '@/backend/controllers/project/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

/**
 * GET /api/projects/[id]/members
 * Get all members of a project
 * Required permission: projects:read
 */
export const GET = hasPermission(
  async (request, context) => {
    const { id } = context.params;
    return projectController.getProjectMembers(request, id);
  },
  'projects',
  'read'
);

/**
 * POST /api/projects/[id]/members
 * Add a member to a project
 * Required permission: projects:manage_members
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id } = context.params;
    return projectController.addProjectMember(request, id);
  },
  'projects',
  'manage_members'
);
