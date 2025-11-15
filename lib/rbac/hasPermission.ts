// Permission checking for RBAC
import type { RBACUser, RBACPrivilege } from './types';

/**
 * Checks if the user has a specific permission (by module, action, and optional scope).
 * @param user - The user object (with role and privileges loaded)
 * @param module - Module keyword (e.g., 'prn', 'tc')
 * @param action - Action keyword (e.g., 'r', 'w', 'u', 'd')
 * @param scope - Optional scope keyword (e.g., 'all', 'project', 'own')
 */
export function hasPermission(
  user: RBACUser,
  module: string,
  action: string,
  scope?: string
): boolean {
  if (!user || !user.role || !user.role.privileges) return false;

  return user.role.privileges.some((priv: RBACPrivilege) =>
    priv.module_keyword === module &&
    priv.action_keyword === action &&
    (scope ? priv.scope_keyword === scope : true)
  );
}
