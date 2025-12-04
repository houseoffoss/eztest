import { userController } from '@/backend/controllers/user/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * PUT /api/users/profile/password
 * Change current user's password
 */
export const PUT = hasPermission(
  async (request) => {
    return userController.changePassword(request);
  },
  'users',
  'update'
);
