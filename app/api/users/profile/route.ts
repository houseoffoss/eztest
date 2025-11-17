import { getSessionUser } from '@/lib/auth/getSessionUser';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { NotFoundException, BadRequestException } from '@/backend/utils/exceptions';

/**
 * GET /api/users/profile
 * Get current user's profile
 */
export async function GET(request: NextRequest) {
  const sessionUser = await getSessionUser();
  const rbacUser = sessionUser && sessionUser.roleObj ? { id: sessionUser.id, email: sessionUser.email, name: sessionUser.name, role: sessionUser.roleObj } : null;
  if (!rbacUser || !hasPermission(rbacUser, 'usr', 'r')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const user = await prisma.user.findUnique({
    where: { id: sessionUser!.id },
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
}

/**
 * PUT /api/users/profile
 * Update current user's profile
 */
export async function PUT(request: NextRequest) {
  const sessionUser = await getSessionUser();
  const rbacUser = sessionUser && sessionUser.roleObj ? { id: sessionUser.id, email: sessionUser.email, name: sessionUser.name, role: sessionUser.roleObj } : null;
  if (!rbacUser || !hasPermission(rbacUser, 'usr', 'u')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
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
    where: { id: sessionUser!.id },
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
}
