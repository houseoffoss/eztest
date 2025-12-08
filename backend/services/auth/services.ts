import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export class AuthService {
  /**
   * Register a new user with TESTER role
   */
  async registerUser(data: RegisterUserInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Get TESTER role
    const testerRole = await prisma.role.findUnique({
      where: { name: 'TESTER' },
    });

    if (!testerRole) {
      throw new Error('System configuration error: TESTER role not found');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        roleId: testerRole.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Change user's password
   */
  async changePassword(data: ChangePasswordInput) {
    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(data.newPassword, user.password);

    if (isSamePassword) {
      throw new Error('New password must be different from current password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: data.userId },
      data: {
        password: hashedPassword,
      },
    });

    return { success: true };
  }

  /**
   * Request password reset token
   */
  async requestPasswordReset(data: ForgotPasswordInput) {
    // Find user - check if email exists in the system
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // If user doesn't exist, throw error
    if (!user) {
      throw new Error('No account found with this email address');
    }

    // If user is deleted, throw error
    if (user.deletedAt) {
      throw new Error('This account has been deleted');
    }

    // Email exists and user is active - generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Create password reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  /**
   * Reset password using token
   */
  async resetPassword(data: ResetPasswordInput) {
    // Find reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: data.token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    // Check if token has expired
    if (new Date() > resetToken.expiresAt) {
      throw new Error('Reset token has expired');
    }

    // Check if token was already used
    if (resetToken.usedAt) {
      throw new Error('Reset token has already been used');
    }

    // Check if user is deleted
    if (resetToken.user.deletedAt) {
      throw new Error('User account has been deleted');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { success: true };
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Extract permission names from user's role
    const permissions = user.role?.permissions?.map(
      (rp) => rp.permission.name
    ) || [];

    return {
      role: user.role?.name || 'UNKNOWN',
      permissions,
    };
  }
}

export const authService = new AuthService();
