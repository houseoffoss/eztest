import { projectController } from '@/backend/controllers/project/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * GET /api/projects
 * List all projects accessible to the current user
 * Required permission: projects:read
 */
export const GET = hasPermission(
  async (request) => {
    return projectController.listProjects(request);
  },
  'projects',
  'read'
);

/**
 * POST /api/projects
 * Create a new project
 * Required permission: projects:create
 */
export const POST = hasPermission(
  async (request) => {
    return projectController.createProject(request);
  },
  'projects',
  'create'
);
