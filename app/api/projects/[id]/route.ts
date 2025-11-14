import { hasPermission } from '@/lib/auth';
import { projectController } from '@/backend/controllers/project/controller';

/**
 * GET /api/projects/[id]
 * Get project details with optional stats
 */
export const GET = hasPermission(
  async (request, { params }) => {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('stats') === 'true';

    return projectController.getProject(
      request,
      id,
      includeStats
    );
  },
  'prn', // projects module
  'r'    // read permission
);

/**
 * PUT /api/projects/[id]
 * Update project information
 */
export const PUT = hasPermission(
  async (request, { params }) => {
    const { id } = await params;

    return projectController.updateProject(
      request,
      id
    );
  },
  'prn', // projects module
  'u'    // update permission
);

/**
 * DELETE /api/projects/[id]
 * Delete a project
 */
export const DELETE = hasPermission(
  async (request, { params }) => {
    const { id } = await params;

    return projectController.deleteProject(
      request,
      id
    );
  },
  'prn', // projects module
  'd'    // delete permission
);
