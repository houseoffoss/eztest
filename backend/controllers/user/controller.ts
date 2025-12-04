import { userService } from '@/backend/services/user/services';
import { CustomRequest } from '@/backend/utils/interceptor';
import { NotFoundException, ValidationException } from '@/backend/utils/exceptions';
import { z } from 'zod';

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  bio: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export class UserController {
  /**
   * Get current user's profile
   * Access already checked by route wrapper
   */
  async getUserProfile(req: CustomRequest) {
    const userId = req.userInfo.id;

    const user = await userService.getUserProfile(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { data: user };
  }

  /**
   * Update current user's profile
   * Permission already checked by route wrapper
   */
  async updateUserProfile(req: CustomRequest) {
    const userId = req.userInfo.id;
    const body = await req.json();

    // Validation with Zod
    const validationResult = updateProfileSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Invalid profile data',
        validationResult.error.issues
      );
    }

    const updatedUser = await userService.updateUserProfile(userId, validationResult.data);

    return { data: updatedUser };
  }

  /**
   * Change current user's password
   * Permission already checked by route wrapper
   */
  async changePassword(req: CustomRequest) {
    const userId = req.userInfo.id;
    const body = await req.json();

    // Validation with Zod
    const validationResult = changePasswordSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Invalid password data',
        validationResult.error.issues
      );
    }

    try {
      await userService.changePassword(userId, validationResult.data);
      return { message: 'Password changed successfully' };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          throw new NotFoundException(error.message);
        }
        if (error.message === 'Current password is incorrect') {
          throw new ValidationException(error.message);
        }
        if (error.message === 'New password must be different from current password') {
          throw new ValidationException(error.message);
        }
      }
      throw error;
    }
  }

  /**
   * Get user details by ID (admin only)
   * Permission already checked by route wrapper
   */
  async getUserById(userId: string) {
    const user = await userService.getUserDetailsById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { data: user };
  }
}

export const userController = new UserController();
