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
 * if (hasPermission(user, "projects:create")) {
 *   // User can create projects
 * }
 */
export function hasPermission(user: any, permissionName: string): boolean {
  if (!user) return false;

  // Extract all permission names from user's role
  const permissions = user.role?.permissions?.map(
    (rp: any) => rp.permission.name
  ) || [];

  return permissions.includes(permissionName);
}

/**
 * Check if user has ANY of the specified permissions
 * @param user - The user object
 * @param permissionNames - Array of permission strings
 * @returns boolean - true if user has at least one permission
 */
export function hasAnyPermission(user: any, permissionNames: string[]): boolean {
  if (!user) return false;

  const permissions = user.role?.permissions?.map(
    (rp: any) => rp.permission.name
  ) || [];

  return permissionNames.some(perm => permissions.includes(perm));
}

/**
 * Check if user has ALL of the specified permissions
 * @param user - The user object
 * @param permissionNames - Array of permission strings
 * @returns boolean - true if user has all permissions
 */
export function hasAllPermissions(user: any, permissionNames: string[]): boolean {
  if (!user) return false;

  const permissions = user.role?.permissions?.map(
    (rp: any) => rp.permission.name
  ) || [];

  return permissionNames.every(perm => permissions.includes(perm));
}
