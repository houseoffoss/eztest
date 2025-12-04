import { userController } from '@/backend/controllers/user/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * GET /api/users/profile
 * Get current user's profile
 */
export const GET = hasPermission(
  async (request) => {
    return userController.getUserProfile(request);
  },
  'users',
  'read'
);

/**
 * PUT /api/users/profile
 * Update current user's profile
 */
export const PUT = hasPermission(
  async (request) => {
    return userController.updateUserProfile(request);
  },
  'users',
  'update'
);
