import { getSessionUser } from '@/lib/auth/getSessionUser';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { projectController } from '@/backend/controllers/project/controller';
import { baseInterceptor } from '@/backend/utils/baseInterceptor';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/projects/[id]/members
 * Get all members of a project
 * Required permission: projects:read
 */
export const GET = baseInterceptor(async (request: NextRequest, context: { params: { id: string } }) => {
  const user = await getSessionUser();
  
  if (!hasPermission(user, 'projects:read')) {
    return NextResponse.json(
      { error: 'Forbidden: Missing projects:read permission' },
      { status: 403 }
    );
  }
  
  const { id } = context.params;
  const customRequest = Object.assign(request, {
    scopeInfo: { access: true, scope_name: 'all' },
    userInfo: {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.role.name,
    },
  });
  
  return projectController.getProjectMembers(customRequest, id);
});

/**
 * POST /api/projects/[id]/members
 * Add a member to a project
 * Required permission: projects:manage_members
 */
export const POST = baseInterceptor(async (request: NextRequest, context: { params: { id: string } }) => {
  const user = await getSessionUser();
  
  if (!hasPermission(user, 'projects:manage_members')) {
    return NextResponse.json(
      { error: 'Forbidden: Missing projects:manage_members permission' },
      { status: 403 }
    );
  }
  
  const { id } = context.params;
  const customRequest = Object.assign(request, {
    scopeInfo: { access: true, scope_name: 'all' },
    userInfo: {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.role.name,
    },
  });
  
  return projectController.addProjectMember(customRequest, id);
});
