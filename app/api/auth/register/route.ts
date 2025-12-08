import { authController } from '@/backend/controllers/auth/controller';
import { NextResponse } from 'next/server';
import { ValidationException } from '@/backend/utils/exceptions';
import { CustomRequest } from '@/backend/utils/interceptor';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await authController.register(req as unknown as CustomRequest, body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof ValidationException) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
