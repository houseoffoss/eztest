import { getSessionUser } from '@/lib/auth/getSessionUser';
import { NextResponse } from 'next/server';

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

    // Extract permission names from user's role
    const permissions = user.role?.permissions?.map(
      (rp) => rp.permission.name
    ) || [];

    return NextResponse.json({
      success: true,
      role: user.role?.name || 'UNKNOWN',
      permissions
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
