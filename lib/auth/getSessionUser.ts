import { auth } from "../auth";
import { prisma } from "../prisma";
import { authOptions } from "../auth";
import { decode } from "next-auth/jwt";
import { headers } from "next/headers";

/**
 * Fetches the current session user with their role and permissions (RBAC).
 * Returns the user with their role object containing all permissions.
 * Returns null if user is deleted or role is invalid.
 * 
 * Supports both:
 * 1. Cookie-based authentication (NextAuth session) - standard flow
 * 2. Bearer token authentication (Authorization header) - for SDK/external clients
 */
export async function getSessionUser() {
  // First, try to get session from cookies (standard NextAuth flow)
  const session = await auth();
  if (session?.user?.email) {
    // Fetch user with their role and permissions
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // Check if user exists and is not deleted
    if (user && !user.deletedAt) {
      return user;
    }
  }

  // If no session from cookies, try Bearer token from Authorization header
  const headersList = await headers();
  const authorization = headersList.get("authorization");
  
  if (authorization && authorization.startsWith("Bearer ")) {
    const token = authorization.substring(7); // Remove "Bearer " prefix
    
    try {
      // Decode and verify the JWT token using NextAuth's secret
      // Note: The token from next-auth.session-token cookie is encrypted,
      // but if it's a raw JWT token, decode will handle it
      if (!authOptions.secret) {
        return null;
      }
      
      const decoded = await decode({
        token: token,
        secret: authOptions.secret,
      });

      if (decoded && typeof decoded === 'object' && 'email' in decoded) {
        const email = decoded.email as string;
        
        // Fetch user with their role and permissions
        const user = await prisma.user.findUnique({
          where: { email: email },
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        });

        // Check if user exists and is not deleted
        if (user && !user.deletedAt) {
          return user;
        }
      }
    } catch (error) {
      // Token is invalid or expired, return null
      // Don't log in production to avoid exposing errors
      if (process.env.NODE_ENV === 'development') {
        console.error("Error verifying Bearer token:", error);
      }
      return null;
    }
  }

  return null;
}
