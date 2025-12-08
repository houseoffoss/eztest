import { getSessionUser } from '@/lib/auth/getSessionUser';
import { authController } from '@/backend/controllers/auth/controller';
import { NextResponse } from 'next/server';
import { ValidationException } from '@/backend/utils/exceptions';
import { CustomRequest } from '@/backend/utils/interceptor';

/**
 * API endpoint to get the current user's permissions
 * Used by the client-side usePermissions hook
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

    const result = await authController.getUserPermissions({} as unknown as CustomRequest, user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    
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
