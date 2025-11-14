import { hasPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@/backend/utils/exceptions';

/**
 * DELETE /api/users/account
 * Soft delete user account (archive for 30 days before permanent deletion)
 * Requires password confirmation for security
 */
export const DELETE = hasPermission(
  async (request) => {
    const { password } = await request.json();

    if (!password || typeof password !== 'string') {
      throw new BadRequestException('Password is required to confirm account deletion');
    }

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: request.userInfo.id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Soft delete: set deletedAt timestamp (30 days from now for archive period)
    const deletionDate = new Date();
    await prisma.user.update({
      where: { id: request.userInfo.id },
      data: {
        deletedAt: deletionDate,
      },
    });

    return NextResponse.json({
      message:
        'Your account has been marked for deletion. It will be permanently deleted in 30 days. You can contact support to restore your account.',
      deleteDate: new Date(deletionDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });
  },
  'usr', // users module
  'd'    // delete permission (own account)
);

/**
 * GET /api/users/account
 * Check if user account is marked for deletion
 */
export const GET = hasPermission(
  async (request) => {
    const user = await prisma.user.findUnique({
      where: { id: request.userInfo.id },
      select: {
        id: true,
        email: true,
        deletedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return NextResponse.json({
      data: {
        isMarkedForDeletion: user.deletedAt !== null,
        markedAt: user.deletedAt,
        permanentDeleteDate: user.deletedAt
          ? new Date(user.deletedAt.getTime() + 30 * 24 * 60 * 60 * 1000)
          : null,
      },
    });
  },
  'usr', // users module
  'r'    // read permission (own account status)
);
