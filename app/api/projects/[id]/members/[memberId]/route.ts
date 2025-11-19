import { projectController } from '@/backend/controllers/project/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

/**
 * DELETE /api/projects/[id]/members/[memberId]
 * Remove a member from a project
 * Required permission: projects:manage_members
 */
export const DELETE = hasPermission(
  async (request, context) => {
    const { id, memberId } = context.params;
    return projectController.removeProjectMember(request, id, memberId);
  },
  'projects',
  'manage_members'
);
