import { NextRequest } from 'next/server';
import { authenticateRequest, requireRoles } from '@/lib/auth-middleware';
import { projectController } from '@/backend/controllers/project/controller';

/**
 * GET /api/projects
 * List all projects accessible to the current user
 */
export async function GET() {
  const auth = await authenticateRequest();
  
  if (auth.error) {
    return auth.error;
  }

  return projectController.listProjects(
    auth.session.user.id,
    auth.session.user.role
  );
}

/**
 * POST /api/projects
 * Create a new project
 * Allowed roles: ADMIN, PROJECT_MANAGER, TESTER (all except VIEWER)
 */
export async function POST(request: NextRequest) {
  const auth = await requireRoles(['ADMIN', 'PROJECT_MANAGER', 'TESTER']);
  
  if (auth.error) {
    return auth.error;
  }

  return projectController.createProject(
    request,
    auth.session.user.id
  );
}
