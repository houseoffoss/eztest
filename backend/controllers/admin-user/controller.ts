import { adminUserService } from '@/backend/services/admin-user/services';
import { updateUserSchema } from '@/backend/validators/admin-user.validator';
import { ValidationException } from '@/backend/utils/exceptions';
import { CustomRequest } from '@/backend/utils/interceptor';
import { UserMessages } from '@/backend/constants/static_messages';

export class AdminUserController {
  /**
   * Get user by ID (Admin only)
   * Permission already checked by route wrapper
   */
  async getUserById(userId: string) {
    const user = await adminUserService.getUserById(userId);
    return { data: user };
  }

  /**
   * Update user by ID (Admin only)
   * Permission already checked by route wrapper
   */
  async updateUser(body: unknown, userId: string, req: CustomRequest) {
    // Validation with Zod
    console.log('Controller - Validating body:', body);
    const validationResult = updateUserSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('Controller - Validation failed:', validationResult.error.issues);
      throw new ValidationException(
        'Invalid user data',
        validationResult.error.issues
      );
    }
    console.log('Controller - Validation passed:', validationResult.data);

    const { updatedUser, changes } = await adminUserService.updateUser(
      userId,
      validationResult.data
    );

    console.log('Controller - Changes detected:', changes);

    // Send email notification if there are changes
    if (changes.length > 0) {
      const adminUserId = req.userInfo.id;
      console.log('Controller - Sending email notification to user:', userId, 'by admin:', adminUserId);
      await adminUserService.sendUserUpdateNotification(userId, adminUserId, changes);
      console.log('Controller - Email notification sent');
    } else {
      console.log('Controller - No changes detected, skipping email');
    }

    return { 
      data: updatedUser,
      message: UserMessages.UserUpdatedSuccessfully 
    };
  }

  /**
   * Delete user by ID (Admin only)
   * Permission already checked by route wrapper
   */
  async deleteUser(userId: string, req: CustomRequest) {
    const adminUserId = req.userInfo.id;

    // Send email notification before deletion
    await adminUserService.sendUserDeleteNotification(userId, adminUserId);

    // Perform soft delete
    await adminUserService.deleteUser(userId);

    return { message: UserMessages.UserDeletedSuccessfully };
  }
}

export const adminUserController = new AdminUserController();
