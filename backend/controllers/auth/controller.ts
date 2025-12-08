import { authService } from '@/backend/services/auth/services';
import {
  registerSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/backend/validators/auth.validator';
import { CustomRequest } from '@/backend/utils/interceptor';
import { ValidationException } from '@/backend/utils/exceptions';
import { sendPasswordResetEmail } from '@/lib/email-service';

export class AuthController {
  /**
   * Register a new user
   */
  async register(req: CustomRequest, body: unknown) {
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    const validatedData = validationResult.data;

    try {
      const user = await authService.registerUser(validatedData);

      return {
        message: 'User created successfully',
        user,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        throw new ValidationException('User with this email already exists');
      }
      throw error;
    }
  }

  /**
   * Change user's password
   */
  async changePassword(req: CustomRequest, userId: string, body: unknown) {
    const validationResult = changePasswordSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    const validatedData = validationResult.data;

    try {
      await authService.changePassword({
        userId,
        currentPassword: validatedData.currentPassword,
        newPassword: validatedData.newPassword,
      });

      return {
        message: 'Password changed successfully',
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('incorrect')) {
          throw new ValidationException('Current password is incorrect');
        }
        if (error.message.includes('different')) {
          throw new ValidationException('New password must be different from current password');
        }
        if (error.message.includes('not found')) {
          throw new ValidationException('User not found');
        }
      }
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(req: CustomRequest, body: unknown) {
    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    const validatedData = validationResult.data;

    try {
      const result = await authService.requestPasswordReset(validatedData);

      // Send email if token was generated
      if (result.token && result.user) {
        const appUrl = process.env.APP_URL || 'http://localhost:3000';
        const resetLink = `${appUrl}/auth/reset-password?token=${result.token}`;

        const emailSent = await sendPasswordResetEmail(
          result.user.email,
          resetLink,
          result.user.name || 'User'
        );

        if (!emailSent) {
          console.error(`Failed to send password reset email to ${result.user.email}, but token was created`);
        } else {
          console.log(`Password reset email sent to ${result.user.email}`);
        }
      }

      return {
        message: 'Password reset instructions have been sent to your email.',
      };
    } catch (error) {
      if (error instanceof Error) {
        // Throw specific error messages from service
        throw new ValidationException(error.message);
      }
      throw error;
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(req: CustomRequest, body: unknown) {
    const validationResult = resetPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    const validatedData = validationResult.data;

    try {
      await authService.resetPassword(validatedData);

      return {
        message: 'Password has been reset successfully. You can now login with your new password.',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ValidationException(error.message);
      }
      throw error;
    }
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(req: CustomRequest, userId: string) {
    try {
      const result = await authService.getUserPermissions(userId);

      return {
        success: true,
        role: result.role,
        permissions: result.permissions,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new ValidationException('User not found');
      }
      throw error;
    }
  }
}

export const authController = new AuthController();
