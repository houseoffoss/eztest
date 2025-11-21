'use client';

import { useSession } from 'next-auth/react';

interface UsePermissionsReturn {
  permissions: string[];
  role: string;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

/**
 * Hook to check user permissions on the client side
 * Gets permissions directly from the session (no API call needed)
 * 
 * @example
 * const { hasPermission, permissions, role } = usePermissions();
 * if (hasPermission('projects:create')) {
 *   // Show create button
 * }
 */
export function usePermissions(): UsePermissionsReturn {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  const permissions = session?.user?.permissions || [];
  const role = session?.user?.roleName || '';

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permList: string[]): boolean => {
    return permList.some(perm => permissions.includes(perm));
  };

  return {
    permissions,
    role,
    isLoading,
    hasPermission,
    hasAnyPermission
  };
}
