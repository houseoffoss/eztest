import { projectController } from '@/backend/controllers/project/controller';
import { hasProjectMemberAccess } from '@/lib/rbac';

/**
 * DELETE /api/projects/[id]/members/[memberId]
 * Remove a member from a project
 * Required permission: projects:manage_members
 * Required: User must be ADMIN or a member of the project
 */
export const DELETE = hasProjectMemberAccess(
  async (request, context) => {
    const { id, memberId } = await context.params;
    return projectController.removeProjectMember(request, id, memberId);
  },
  'projects',
  'manage_members'
);
