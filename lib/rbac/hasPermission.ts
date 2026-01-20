import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { authenticateRequest, AuthenticatedUser } from '@/lib/auth/apiKeyAuth';
import { baseInterceptor, BaseApiMethod } from '@/backend/utils/baseInterceptor';
import { CustomRequest, ScopeInfo, UserInfo } from '@/backend/utils/interceptor';
import { prisma } from '@/lib/prisma';

type UserWithRole = Prisma.UserGetPayload<{
  include: { role: { include: { permissions: { include: { permission: true } } } } };
}>;

/**
 * Simple permission checking for RBAC
 * Checks if a user has a specific permission string
 * 
 * @param user - The user object (from getSessionUser or authenticateRequest)
 * @param permissionName - The permission string to check (e.g., "projects:create")
 * @returns boolean - true if user has the permission
 * 
 * @example
 * const user = await getSessionUser();
 * if (checkPermission(user, "projects:create")) {
 *   // User can create projects
 * }
 */
export function checkPermission(user: UserWithRole | AuthenticatedUser | null, permissionName: string): boolean {
  if (!user) return false;

  // Extract all permission names from user's role
  const permissions = user.role?.permissions?.map(
    (rp) => rp.permission.name
  ) || [];

  return permissions.includes(permissionName);
}

/**
 * Check if user has ANY of the specified permissions
 * @param user - The user object
 * @param permissionNames - Array of permission strings
 * @returns boolean - true if user has at least one permission
 */
export function hasAnyPermission(user: UserWithRole | AuthenticatedUser | null, permissionNames: string[]): boolean {
  if (!user) return false;

  const permissions = user.role?.permissions?.map(
    (rp) => rp.permission.name
  ) || [];

  return permissionNames.some(perm => permissions.includes(perm));
}

/**
 * Check if user has ALL of the specified permissions
 * @param user - The user object
 * @param permissionNames - Array of permission strings
 * @returns boolean - true if user has all permissions
 */
export function hasAllPermissions(user: UserWithRole | AuthenticatedUser | null, permissionNames: string[]): boolean {
  if (!user) return false;

  const permissions = user.role?.permissions?.map(
    (rp) => rp.permission.name
  ) || [];

  return permissionNames.every(perm => permissions.includes(perm));
}

/**
 * Higher-order function that wraps API route handlers with permission checking
 * 
 * @param apiMethod - The API route handler function
 * @param module - The permission module (e.g., 'projects', 'testcases')
 * @param action - The permission action (e.g., 'read', 'create', 'update', 'delete')
 * @returns A wrapped handler with authentication and authorization
 * 
 * @example
 * export const GET = hasPermission(
 *   async (request, context) => {
 *     // Your route logic here
 *     return NextResponse.json({ data: [] });
 *   },
 *   'projects',
 *   'read'
 * );
 */
export function hasPermission(
  apiMethod: BaseApiMethod<CustomRequest>,
  module: string,
  action: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  return baseInterceptor<CustomRequest>(async (request: NextRequest, context) => {
    // Extract projectId from URL if available (for project-specific key validation)
    let projectId: string | undefined;
    try {
      const params = await context.params;
      if (params && 'id' in params) {
        projectId = params.id as string;
      }
    } catch {
      // No projectId in URL, that's fine
    }

    // Authenticate using either API key or session
    const authenticatedUser = await authenticateRequest(request);
    
    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Convert authenticated user to UserWithRole format for permission checking
    // The authenticatedUser already has the correct structure from Prisma
    const user = authenticatedUser as unknown as UserWithRole;

    // Check if API key is project-specific and matches the requested project
    if (projectId && authenticatedUser.projectId) {
      if (authenticatedUser.projectId !== projectId) {
        return NextResponse.json(
          { success: false, message: 'Forbidden: API key does not have access to this project' },
          { status: 403 }
        );
      }
    }

    // Check permission using module:action format
    const permissionName = `${module}:${action}`;
    const hasAccess = checkPermission(user, permissionName);

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    // If projectId is in URL, verify user has access to that project
    // (unless API key is already project-specific and validated above)
    if (projectId && !authenticatedUser.projectId) {
      // For ADMIN, allow access to any project
      if (authenticatedUser.role.name !== 'ADMIN') {
        // For non-admin users, check if they're a member of this project
        const projectMembership = await prisma.projectMember.findUnique({
          where: {
            projectId_userId: {
              projectId,
              userId: authenticatedUser.id,
            },
          },
        });

        if (!projectMembership) {
          return NextResponse.json(
            { success: false, message: 'Forbidden: You are not a member of this project' },
            { status: 403 }
          );
        }
      }
    }

    // Determine scope based on user role
    // If API key is scoped to a project, limit scope to that project
    const scope: 'all' | 'project' = authenticatedUser.role.name === 'ADMIN' && !authenticatedUser.projectId 
      ? 'all' 
      : 'project';

    // Attach user info and scope to request
    const customRequest = request as CustomRequest;
    customRequest.userInfo = {
      id: authenticatedUser.id,
      email: authenticatedUser.email,
      name: authenticatedUser.name,
      role: authenticatedUser.role.name
    } as UserInfo;

    customRequest.scopeInfo = {
      access: hasAccess,
      scope_name: scope
    } as ScopeInfo;

    // Attach projectId if API key is scoped
    if (authenticatedUser.projectId) {
      (customRequest as any).apiKeyProjectId = authenticatedUser.projectId;
    }

    // Call the actual API method with enhanced request
    return apiMethod(customRequest, context);
  });
}
