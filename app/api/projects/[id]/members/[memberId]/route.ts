import { getSessionUser } from '@/lib/auth/getSessionUser';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { projectController } from '@/backend/controllers/project/controller';
import { NextRequest } from 'next/server';

/**
 * DELETE /api/projects/[id]/members/[memberId]
 * Remove a member from a project
 */
export async function DELETE(request: NextRequest, context: { params: { id: string, memberId: string } }) {
  const user = await getSessionUser();
  const rbacUser = user && user.roleObj ? { id: user.id, email: user.email, name: user.name, role: user.roleObj } : null;
  if (!rbacUser || !hasPermission(rbacUser, 'prn', 'd')) {
    return new Response('Forbidden', { status: 403 });
  }
  const { id, memberId } = context.params;
  const customRequest = Object.assign(request, {
    scopeInfo: { access: true, scope_name: 'all' },
    userInfo: {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.roleEnum,
    },
  });
  return projectController.removeProjectMember(customRequest, id, memberId);
}
