import { roleController } from '@/backend/controllers/role/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

/**
 * GET /api/roles
 * Get all roles
 * Required permission: users:read (only admins need to see roles)
 */
export const GET = hasPermission(
  async () => {
    return roleController.getAllRoles();
  },
  'users',
  'read'
);
