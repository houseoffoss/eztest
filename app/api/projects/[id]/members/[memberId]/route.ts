import { hasPermission } from '@/lib/auth';
import { projectController } from '@/backend/controllers/project/controller';

/**
 * DELETE /api/projects/[id]/members/[memberId]
 * Remove a member from a project
 */
export const DELETE = hasPermission(
  async (request, { params }) => {
    const { id, memberId } = await params;

    return projectController.removeProjectMember(
      request,
      id,
      memberId
    );
  },
  'prn', // projects module
  'd'    // delete permission (removing members)
);
