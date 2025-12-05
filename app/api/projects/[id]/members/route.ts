import { projectController } from '@/backend/controllers/project/controller';
import { hasProjectMemberAccess, hasPermission } from '@/lib/rbac';

/**
 * GET /api/projects/[id]/members
 * Get all members of a project
 * Required permission: projects:read
 */
export const GET = hasPermission(
  async (request, context) => {
    const { id } = await context.params;
    return projectController.getProjectMembers(request, id);
  },
  'projects',
  'read'
);

/**
 * POST /api/projects/[id]/members
 * Add a member to a project
 * Required permission: projects:manage_members
 * Required: User must be ADMIN or a member of the project
 */
export const POST = hasProjectMemberAccess(
  async (request, context) => {
    const { id } = await context.params;
    return projectController.addProjectMember(request, id);
  },
  'projects',
  'manage_members'
);
