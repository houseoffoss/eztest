import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { authController } from '@/backend/controllers/auth/controller';
import { NextRequest, NextResponse } from 'next/server';
import { ValidationException } from '@/backend/utils/exceptions';
import { CustomRequest } from '@/backend/utils/interceptor';

/**
 * POST /api/auth/change-password
 * Change user's password
 * Requires current password verification
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = await authController.changePassword(
      request as unknown as CustomRequest,
      session.user.id,
      body
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/auth/change-password error:', error);
    
    if (error instanceof ValidationException) {
      const status = error.message.includes('incorrect') ? 401 : 400;
      return NextResponse.json(
        { error: error.message },
        { status }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
