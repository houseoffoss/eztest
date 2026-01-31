import { hasPermission, checkPermission } from '@/lib/rbac/hasPermission';
import { getSessionUser } from '@/lib/auth/getSessionUser';
import { prisma } from '@/lib/prisma';
import { emailService } from '@/backend/services/email/services';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

/**
 * GET /api/users
 * Get all users for project member selection
 * Allowed for: users with users:read permission (ADMIN) and PROJECT_MANAGER/TESTER for member selection
 */
export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Allow ADMIN users and any user with users:read permission
    const hasReadPermission = checkPermission(user, 'users:read');
    const isProjectManagerOrTester = user.role?.name === 'PROJECT_MANAGER' || user.role?.name === 'TESTER' || user.role?.name === 'ADMIN';

    if (!hasReadPermission && !isProjectManagerOrTester) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // For PROJECT_MANAGER/TESTER, return minimal user data for selection
    // For ADMIN, return full user data
    if (user.role?.name === 'ADMIN' && hasReadPermission) {
      const users = await prisma.user.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              projects: true,
              createdProjects: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return NextResponse.json({
        data: users,
        error: null,
      });
    } else {
      // For non-admin users (member selection)
      const users = await prisma.user.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      return NextResponse.json({
        data: users,
        error: null,
      });
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        data: null,
        error: 'Failed to fetch users',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Create a new user (admin only)
 * Required permission: users:create
 */
export const POST = hasPermission(
  async (request) => {
    try {
      const body = await request.json();
      const { name, email, password, roleId } = body;
      const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000';

      // Validation
      if (!name || !email || !password || !roleId) {
        return NextResponse.json(
          {
            data: null,
            error: 'Name, email, password, and role are required',
          },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          {
            data: null,
            error: 'User with this email already exists',
          },
          { status: 409 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          roleId,
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

      // Send invitation email to newly created user (non-blocking, async)
      const sessionUser = await getSessionUser();
      if (sessionUser?.id) {
        emailService
          .sendUserInvitationEmail({
            userId: user.id,
            tempPassword: password,
            invitedByUserId: sessionUser.id,
            appUrl,
          })
          .catch((error) => {
            console.error('Failed to send user invitation email:', error);
          });
      }

      // Remove password from response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;

      return NextResponse.json(
        {
          data: userWithoutPassword,
          error: null,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error creating user:', error);
      return NextResponse.json(
        {
          data: null,
          error: 'Failed to create user',
        },
        { status: 500 }
      );
    }
  },
  'users',
  'create'
);
