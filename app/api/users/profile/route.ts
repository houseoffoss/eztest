import { hasPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { NotFoundException, BadRequestException } from '@/backend/utils/exceptions';

/**
 * GET /api/users/profile
 * Get current user's profile
 */
export const GET = hasPermission(
  async (request) => {
    const user = await prisma.user.findUnique({
      where: { id: request.userInfo.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        phone: true,
        location: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return NextResponse.json({ data: user });
  },
  'usr', // users module
  'r'    // read permission (own profile)
);

/**
 * PUT /api/users/profile
 * Update current user's profile
 */
export const PUT = hasPermission(
  async (request) => {
    const body = await request.json();
    const { name, bio, phone, location } = body;

    // Validate input
    if (name && name.length < 1) {
      throw new BadRequestException('Name must not be empty');
    }

    if (name && name.length > 255) {
      throw new BadRequestException('Name must be less than 255 characters');
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: request.userInfo.id },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio: bio || null }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(location !== undefined && { location: location || null }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        phone: true,
        location: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ data: updatedUser });
  },
  'usr', // users module
  'u'    // update permission (own profile)
);
