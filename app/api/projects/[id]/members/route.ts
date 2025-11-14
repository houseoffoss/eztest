import { hasPermission } from '@/lib/auth';
import { projectController } from '@/backend/controllers/project/controller';

/**
 * GET /api/projects/[id]/members
 * Get all members of a project
 */
export const GET = hasPermission(
  async (request, { params }) => {
    const { id } = await params;

    return projectController.getProjectMembers(
      request,
      id
    );
  },
  'prn', // projects module
  'r'    // read permission
);

/**
 * POST /api/projects/[id]/members
 * Add a member to a project
 */
export const POST = hasPermission(
  async (request, { params }) => {
    const { id } = await params;

    return projectController.addProjectMember(
      request,
      id
    );
  },
  'prn', // projects module
  'u'    // update permission (adding members)
);
