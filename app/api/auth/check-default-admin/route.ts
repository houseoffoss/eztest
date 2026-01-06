import { NextRequest, NextResponse } from 'next/server';
import { isDefaultAdminCredentials } from '@/lib/auth-utils';

/**
 * POST /api/auth/check-default-admin
 * Check if provided credentials match the default admin credentials
 * This endpoint is used by the client to determine if OTP should be skipped
 * 
 * ⚠️ SECURITY: This endpoint only returns a boolean - it does NOT authenticate the user
 * Actual authentication still happens through NextAuth.js
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if credentials match default admin (server-side only)
    const isDefaultAdmin = isDefaultAdminCredentials(email.trim(), password);

    return NextResponse.json({
      success: true,
      isDefaultAdmin,
    });
  } catch (error) {
    console.error('Error checking default admin credentials:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

