import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

interface UpdateProfileInput {
  name?: string;
  bio?: string | null;
  phone?: string | null;
  location?: string | null;
}

interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export class UserService {
  /**
   * Get user profile by user ID
   */
  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        phone: true,
        location: true,
        role: {
          select: {
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      role: user.role.name,
    };
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, data: UpdateProfileInput) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.bio !== undefined && { bio: data.bio || null }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.location !== undefined && { location: data.location || null }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        phone: true,
        location: true,
        role: {
          select: {
            name: true,
          },
        },
        updatedAt: true,
      },
    });

    return {
      ...updatedUser,
      role: updatedUser.role.name,
    };
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, data: ChangePasswordInput) {
    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });
  }

  /**
   * Get user details by ID (for admin use)
   */
  async getUserDetailsById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        phone: true,
        location: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        _count: {
          select: {
            createdProjects: true,
          },
        },
      },
    });

    return user;
  }
}

export const userService = new UserService();
