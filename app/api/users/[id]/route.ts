import { hasPermission } from '@/lib/rbac/hasPermission';
import { adminUserController } from '@/backend/controllers/admin-user/controller';

/**
 * GET /api/users/[id]
 * Get user details by ID (admin only)
 * Required permission: users:read
 */
export const GET = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return adminUserController.getUserById(id);
  },
  'users',
  'read'
);

/**
 * PUT /api/users/[id]
 * Update a user (admin only)
 * Required permission: users:update
 */
export const PUT = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    const body = await request.json();
    return adminUserController.updateUser(body, id, request);
  },
  'users',
  'update'
);

/**
 * DELETE /api/users/[id]
 * Soft delete a user (admin only)
 * Required permission: users:delete
 */
export const DELETE = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return adminUserController.deleteUser(id, request);
  },
  'users',
  'delete'
);
