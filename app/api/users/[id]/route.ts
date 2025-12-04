import { hasPermission } from '@/lib/rbac/hasPermission';
import { userController } from '@/backend/controllers/user/controller';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * GET /api/users/[id]
 * Get user details by ID (admin only)
 * Required permission: users:read
 */
export const GET = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return userController.getUserById(id);
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
    try {
      const { id } = await context!.params;
      const body = await request.json();
      const { name, email, roleId, avatar, bio, phone, location } = body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return NextResponse.json(
          {
            data: null,
            error: 'User not found',
          },
          { status: 404 }
        );
      }

      // If email is being changed, check for conflicts
      if (email && email !== existingUser.email) {
        const emailConflict = await prisma.user.findUnique({
          where: { email },
        });

        if (emailConflict) {
          return NextResponse.json(
            {
              data: null,
              error: 'Email already in use',
            },
            { status: 409 }
          );
        }
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(roleId && { roleId }),
          ...(avatar !== undefined && { avatar }),
          ...(bio !== undefined && { bio }),
          ...(phone !== undefined && { phone }),
          ...(location !== undefined && { location }),
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
      const { password: _, ...userWithoutPassword } = updatedUser;

      return NextResponse.json({
        data: userWithoutPassword,
        error: null,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      return NextResponse.json(
        {
          data: null,
          error: 'Failed to update user',
        },
        { status: 500 }
      );
    }
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
    try {
      const { id } = await context!.params;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return NextResponse.json(
          {
            data: null,
            error: 'User not found',
          },
          { status: 404 }
        );
      }

      // Soft delete user
      await prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: 'User deleted successfully',
        error: null,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json(
        {
          data: null,
          error: 'Failed to delete user',
        },
        { status: 500 }
      );
    }
  },
  'users',
  'delete'
);
