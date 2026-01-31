import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getSessionUser } from '@/lib/auth/getSessionUser';
import { baseInterceptor, BaseApiMethod } from '@/backend/utils/baseInterceptor';
import { CustomRequest, ScopeInfo, UserInfo } from '@/backend/utils/interceptor';
import { prisma } from '@/lib/prisma';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type UserWithRole = Prisma.UserGetPayload<{
  include: { role: { include: { permissions: { include: { permission: true } } } } };
}>;

/**
 * Check if user has permission AND is a project member (or is ADMIN)
 * 
 * For PROJECT_MANAGER and other roles:
 * - Must have the required permission
 * - Must be a member of the specific project
 * 
 * For ADMIN:
 * - Only needs the permission (can access any project)
 * 
 * @param apiMethod - The API route handler function
 * @param module - The permission module (e.g., 'projects')
 * @param action - The permission action (e.g., 'manage_members')
 * @returns A wrapped handler with authentication, authorization, and project membership check
 * 
 * @example
 * export const POST = hasProjectMemberAccess(
 *   async (request, context) => {
 *     // Your route logic here
 *     return projectController.addProjectMember(request, projectId);
 *   },
 *   'projects',
 *   'manage_members'
 * );
 */
export function hasProjectMemberAccess(
  apiMethod: BaseApiMethod<CustomRequest>,
  module: string,
  action: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  return baseInterceptor<CustomRequest>(async (request: NextRequest, context) => {
    // Get authenticated user
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permission using module:action format
    const permissionName = `${module}:${action}`;
    const userPermissions = user.role?.permissions?.map(
      (rp) => rp.permission.name
    ) || [];
    const hasPermission = userPermissions.includes(permissionName);

    if (!hasPermission) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get project ID from route params (await for Next.js 15)
    const params = await context.params;
    const { id: projectId } = params;

    // For ADMIN, allow access to any project
    if (user.role.name === 'ADMIN') {
      const customRequest = request as CustomRequest;
      customRequest.userInfo = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name
      } as UserInfo;

      customRequest.scopeInfo = {
        access: hasPermission,
        scope_name: 'all'
      } as ScopeInfo;

      return apiMethod(customRequest, context);
    }

    // For non-admin users, check if they're a member of this project
    const projectMembership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: user.id
        }
      }
    });

    if (!projectMembership) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: You are not a member of this project' },
        { status: 403 }
      );
    }

    // User is a member of the project and has the permission
    const customRequest = request as CustomRequest;
    customRequest.userInfo = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name
    } as UserInfo;

    customRequest.scopeInfo = {
      access: hasPermission,
      scope_name: 'project'
    } as ScopeInfo;

    return apiMethod(customRequest, context);
  });
}
