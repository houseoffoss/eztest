import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getSessionUser } from '@/lib/auth/getSessionUser';
import { baseInterceptor, BaseApiMethod } from '@/backend/utils/baseInterceptor';
import { CustomRequest, ScopeInfo, UserInfo } from '@/backend/utils/interceptor';

type UserWithRole = Prisma.UserGetPayload<{
  include: { role: { include: { permissions: { include: { permission: true } } } } };
}>;

/**
 * Simple permission checking for RBAC
 * Checks if a user has a specific permission string
 * 
 * @param user - The user object with role.permissions loaded (from getSessionUser)
 * @param permissionName - The permission string to check (e.g., "projects:create")
 * @returns boolean - true if user has the permission
 * 
 * @example
 * const user = await getSessionUser();
 * if (checkPermission(user, "projects:create")) {
 *   // User can create projects
 * }
 */
export function checkPermission(user: UserWithRole | null, permissionName: string): boolean {
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
export function hasAnyPermission(user: UserWithRole | null, permissionNames: string[]): boolean {
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
export function hasAllPermissions(user: UserWithRole | null, permissionNames: string[]): boolean {
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
): BaseApiMethod<CustomRequest> {
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
    const hasAccess = checkPermission(user, permissionName);

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    // Determine scope based on user role
    const scope: 'all' | 'project' = user.role.name === 'ADMIN' ? 'all' : 'project';

    // Attach user info and scope to request
    const customRequest = request as CustomRequest;
    customRequest.userInfo = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name
    } as UserInfo;

    customRequest.scopeInfo = {
      access: hasAccess,
      scope_name: scope
    } as ScopeInfo;

    // Call the actual API method with enhanced request
    return apiMethod(customRequest, context);
  });
}
