import { getSessionUser } from '@/lib/auth/getSessionUser';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { projectController } from '@/backend/controllers/project/controller';
import { NextRequest } from 'next/server';

/**
 * GET /api/projects
 * List all projects accessible to the current user
 */
export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  const rbacUser = user && user.roleObj ? { id: user.id, email: user.email, name: user.name, role: user.roleObj } : null;
  if (!rbacUser || !hasPermission(rbacUser, 'prn', 'r')) {
    return new Response('Forbidden', { status: 403 });
  }
  const customRequest = Object.assign(request, {
    scopeInfo: { access: true, scope_name: 'all' },
    userInfo: {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.roleEnum,
    },
  });
  return projectController.listProjects(customRequest);
}

/**
 * POST /api/projects
 * Create a new project
 * Allowed roles: ADMIN, PROJECT_MANAGER, TESTER (all except VIEWER)
 */
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  const rbacUser = user && user.roleObj ? { id: user.id, email: user.email, name: user.name, role: user.roleObj } : null;
  if (!rbacUser || !hasPermission(rbacUser, 'prn', 'w')) {
    return new Response('Forbidden', { status: 403 });
  }
  const customRequest = Object.assign(request, {
    scopeInfo: { access: true, scope_name: 'all' },
    userInfo: {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.roleEnum,
    },
  });
  return projectController.createProject(customRequest);
}
