import { prisma } from '@/lib/prisma';
import { emailService } from '@/backend/services/email/services';
import { NotFoundException, ValidationException } from '@/backend/utils/exceptions';

interface UpdateUserInput {
  name?: string;
  email?: string;
  roleId?: string;
  avatar?: string | null;
  bio?: string | null;
  phone?: string | null;
  location?: string | null;
}

interface UpdateUserResult {
  updatedUser: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    bio: string | null;
    phone: string | null;
    location: string | null;
    createdAt: Date;
    updatedAt: Date;
    role: {
      id: string;
      name: string;
    };
  };
  changes: string[];
}

export class AdminUserService {
  /**
   * Get user details by ID
   */
  async getUserById(userId: string) {
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
        deletedAt: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            createdProjects: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update user by ID (Admin only)
   */
  async updateUser(userId: string, data: UpdateUserInput): Promise<UpdateUserResult> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // If email is being changed, check for conflicts
    if (data.email && data.email !== existingUser.email) {
      const emailConflict = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailConflict) {
        throw new ValidationException('Email already in use');
      }
    }

    // Track changes for email notification
    const changes: string[] = [];
    
    if (data.name !== undefined && data.name !== existingUser.name) {
      changes.push(`Name updated to: ${data.name}`);
    }
    if (data.email !== undefined && data.email !== existingUser.email) {
      changes.push(`Email updated to: ${data.email}`);
    }
    if (data.roleId !== undefined && data.roleId !== existingUser.roleId) {
      const newRole = await prisma.role.findUnique({ where: { id: data.roleId } });
      if (newRole) {
        changes.push(`Role updated to: ${newRole.name}`);
      }
    }
    if (data.bio !== undefined && data.bio !== existingUser.bio) {
      changes.push('Bio updated');
    }
    if (data.phone !== undefined && data.phone !== existingUser.phone) {
      changes.push('Phone number updated');
    }
    if (data.location !== undefined && data.location !== existingUser.location) {
      changes.push('Location updated');
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.roleId && { roleId: data.roleId }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.location !== undefined && { location: data.location }),
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = updatedUser;

    return {
      updatedUser: userWithoutPassword,
      changes,
    };
  }

  /**
   * Send user update notification email
   */
  async sendUserUpdateNotification(userId: string, updatedByUserId: string, changes: string[]) {
    if (changes.length === 0) {
      console.log('Service - No changes to notify about');
      return;
    }

    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    console.log('Service - Preparing to send email for changes:', changes);

    try {
      const result = await emailService.sendUserUpdateEmail({
        userId,
        updatedByUserId,
        changes,
        appUrl,
      });
      console.log('Service - Email service returned:', result);
    } catch (error) {
      console.error('Failed to send user update email:', error);
    }
  }

  /**
   * Delete user by ID (Soft delete)
   */
  async deleteUser(userId: string) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete user
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Send user delete notification email
   */
  async sendUserDeleteNotification(userId: string, deletedByUserId: string) {
    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    try {
      await emailService.sendUserDeleteEmail({
        userId,
        deletedByUserId,
        appUrl,
      });
    } catch (error) {
      console.error('Failed to send user delete email:', error);
    }
  }
}

export const adminUserService = new AdminUserService();
