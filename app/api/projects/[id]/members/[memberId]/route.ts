import { getSessionUser } from '@/lib/auth/getSessionUser';
import { checkPermission } from '@/lib/rbac';
import { projectController } from '@/backend/controllers/project/controller';
import { baseInterceptor } from '@/backend/utils/baseInterceptor';
import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE /api/projects/[id]/members/[memberId]
 * Remove a member from a project
 * Required permission: projects:manage_members
 */
export const DELETE = baseInterceptor(async (request: NextRequest, context: { params: { id: string, memberId: string } }) => {
  const user = await getSessionUser();
  
  if (!checkPermission(user, 'projects:manage_members')) {
    return NextResponse.json(
      { error: 'Forbidden: Missing projects:manage_members permission' },
      { status: 403 }
    );
  }
  
  const { id, memberId } = context.params;
  const customRequest = Object.assign(request, {
    scopeInfo: { access: true, scope_name: 'all' },
    userInfo: {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.role.name,
    },
  });
  
  return projectController.removeProjectMember(customRequest, id, memberId);
});
