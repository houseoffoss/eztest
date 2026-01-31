import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware() {
    // Allow the request to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;

        // Public routes that don't require authentication
        if (
          pathname.startsWith('/auth/') ||
          pathname.startsWith('/api/auth/') ||
          pathname === '/' ||
          pathname === '/ui' ||
          pathname === '/privacy'
        ) {
          return true;
        }

        // API routes handle their own authentication via hasPermission
        // Don't block them here - let the route handler decide
        if (pathname.startsWith('/api/')) {
          return true;
        }

        // Settings routes require authentication
        if (pathname.startsWith('/settings/')) {
          return !!token;
        }

        // All other routes require authentication
        return !!token;
      },
    },
    pages: {
      signIn: '/auth/login',
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (NextAuth routes)
     * - api/health (health check endpoint)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth|api/health|.*\\..*|public).*)',
  ],
};
