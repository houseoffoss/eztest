import { getSessionUser } from '@/lib/auth/getSessionUser';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { projectController } from '@/backend/controllers/project/controller';
import { NextRequest } from 'next/server';

/**
 * GET /api/projects/[id]/members
 * Get all members of a project
 */
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const user = await getSessionUser();
  const rbacUser = user && user.roleObj ? { id: user.id, email: user.email, name: user.name, role: user.roleObj } : null;
  if (!rbacUser || !hasPermission(rbacUser, 'prn', 'r')) {
    return new Response('Forbidden', { status: 403 });
  }
  const { id } = context.params;
  const customRequest = Object.assign(request, {
    scopeInfo: { access: true, scope_name: 'all' },
    userInfo: {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.roleEnum,
    },
  });
  return projectController.getProjectMembers(customRequest, id);
}

/**
 * POST /api/projects/[id]/members
 * Add a member to a project
 */
export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const user = await getSessionUser();
  const rbacUser = user && user.roleObj ? { id: user.id, email: user.email, name: user.name, role: user.roleObj } : null;
  if (!rbacUser || !hasPermission(rbacUser, 'prn', 'u')) {
    return new Response('Forbidden', { status: 403 });
  }
  const { id } = context.params;
  const customRequest = Object.assign(request, {
    scopeInfo: { access: true, scope_name: 'all' },
    userInfo: {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.roleEnum,
    },
  });
  return projectController.addProjectMember(customRequest, id);
}
