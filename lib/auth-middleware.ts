import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export interface AuthenticatedSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

/**
 * Middleware to authenticate requests
 * Returns authenticated session or error response
 */
export async function authenticateRequest(): Promise<
  { session: AuthenticatedSession; error: null } | 
  { session: null; error: NextResponse }
> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return {
      session: null,
      error: NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      ),
    };
  }

  return {
    session: session as AuthenticatedSession,
    error: null,
  };
}

/**
 * Check if user has required role
 */
export function hasRequiredRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Middleware to check if user is an admin
 */
export async function requireAdmin(): Promise<
  { session: AuthenticatedSession; error: null } | 
  { session: null; error: NextResponse }
> {
  const auth = await authenticateRequest();
  
  if (auth.error) {
    return auth;
  }

  if (auth.session.user.role !== 'ADMIN') {
    return {
      session: null,
      error: NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      ),
    };
  }

  return auth;
}

/**
 * Middleware to check if user has one of the allowed roles
 */
export async function requireRoles(allowedRoles: UserRole[]): Promise<
  { session: AuthenticatedSession; error: null } | 
  { session: null; error: NextResponse }
> {
  const auth = await authenticateRequest();
  
  if (auth.error) {
    return auth;
  }

  if (!hasRequiredRole(auth.session.user.role, allowedRoles)) {
    return {
      session: null,
      error: NextResponse.json(
        { error: `Forbidden. Required roles: ${allowedRoles.join(', ')}` },
        { status: 403 }
      ),
    };
  }

  return auth;
}
