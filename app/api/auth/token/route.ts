import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { encode } from 'next-auth/jwt';

/**
 * GET /api/auth/token
 * 
 * Returns a JWT token that can be used in Authorization Bearer header.
 * This endpoint requires the user to be authenticated via session cookie.
 * 
 * Use this endpoint to get a token for SDK/external API usage.
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current session (from cookie)
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Please log in first' },
        { status: 401 }
      );
    }

    if (!authOptions.secret) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create a JWT token with user information
    const token = await encode({
      token: {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.name || '',
        roleName: session.user.roleName || 'TESTER',
        permissions: session.user.permissions || [],
      },
      secret: authOptions.secret,
      maxAge: 30 * 24 * 60 * 60, // 30 days (same as session)
    });

    return NextResponse.json({
      success: true,
      token: token,
      expiresIn: 30 * 24 * 60 * 60, // 30 days in seconds
      message: 'Use this token in Authorization: Bearer <token> header',
    });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate token' },
      { status: 500 }
    );
  }
}

