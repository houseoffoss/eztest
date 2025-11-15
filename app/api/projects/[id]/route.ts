import { getSessionUser } from '@/lib/auth/getSessionUser';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { projectController } from '@/backend/controllers/project/controller';
import { NextRequest } from 'next/server';

/**
 * GET /api/projects/[id]
 * Get project details with optional stats
 */
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const user = await getSessionUser();
  const rbacUser = user && user.roleObj ? { id: user.id, email: user.email, name: user.name, role: user.roleObj } : null;
  if (!rbacUser || !hasPermission(rbacUser, 'prn', 'r')) {
    return new Response('Forbidden', { status: 403 });
  }
  const { id } = context.params;
  const { searchParams } = new URL(request.url);
  const includeStats = searchParams.get('stats') === 'true';
  const customRequest = Object.assign(request, {
    scopeInfo: { access: true, scope_name: 'all' },
    userInfo: {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.roleEnum, // Always the UserRole enum value
    },
  });
  return projectController.getProject(customRequest, id, includeStats);
}

/**
 * PUT /api/projects/[id]
 * Update project information
 */
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
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
      role: user!.roleEnum, // Always the UserRole enum value
    },
  });
  return projectController.updateProject(customRequest, id);
}

/**
 * DELETE /api/projects/[id]
 * Delete a project
 */
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  const user = await getSessionUser();
  const rbacUser = user && user.roleObj ? { id: user.id, email: user.email, name: user.name, role: user.roleObj } : null;
  if (!rbacUser || !hasPermission(rbacUser, 'prn', 'd')) {
    return new Response('Forbidden', { status: 403 });
  }
  const { id } = context.params;
  const customRequest = Object.assign(request, {
    scopeInfo: { access: true, scope_name: 'all' },
    userInfo: {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.roleEnum, // Always the UserRole enum value
    },
  });
  return projectController.deleteProject(customRequest, id);
}
