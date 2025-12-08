import { NextRequest, NextResponse } from 'next/server';
import { authController } from '@/backend/controllers/auth/controller';
import { ValidationException } from '@/backend/utils/exceptions';
import { CustomRequest } from '@/backend/utils/interceptor';

/**
 * POST /api/auth/forgot-password
 * Request password reset email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await authController.forgotPassword(request as unknown as CustomRequest, body);

    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/auth/forgot-password error:', error);
    
    if (error instanceof ValidationException) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
