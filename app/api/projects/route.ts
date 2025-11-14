import { hasPermission } from '@/lib/auth';
import { projectController } from '@/backend/controllers/project/controller';

/**
 * GET /api/projects
 * List all projects accessible to the current user
 */
export const GET = hasPermission(
  async (request) => {
    return projectController.listProjects(request);
  },
  'prn', // projects module
  'r'    // read permission
);

/**
 * POST /api/projects
 * Create a new project
 * Allowed roles: ADMIN, PROJECT_MANAGER, TESTER (all except VIEWER)
 */
export const POST = hasPermission(
  async (request) => {
    return projectController.createProject(request);
  },
  'prn', // projects module
  'w'    // write permission
);
