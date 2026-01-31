import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import * as bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { prisma } from './prisma';
import { getEnv } from './env-validation';
import { UnauthorizedException } from '@/backend/utils/exceptions';
import { BaseApiMethod, baseInterceptor } from '@/backend/utils/baseInterceptor';
import { CustomRequest } from '@/backend/utils/interceptor';

// Validate environment on import
const env = getEnv();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        // Check if user is deleted
        if (user.deletedAt) {
          throw new Error('Your account has been deleted. Please contact your administrator.');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        // Fetch role to get role name
        const userWithRole = await prisma.user.findUnique({
          where: { id: user.id },
          include: { role: true },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          roleName: userWithRole?.role.name || 'TESTER',
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Fetch user's role and permissions from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
        
        token.roleName = dbUser?.role.name || 'TESTER';
        // Extract permission names array
        token.permissions = dbUser?.role.permissions?.map(
          (rp) => rp.permission.name
        ) || [];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roleName = token.roleName as string;
        // Add permissions to session
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },
  },
  secret: env.nextAuthSecret,
  debug: env.nodeEnv === 'development',
};

/**
 * Get the current authenticated session
 */
export async function auth() {
  return await getServerSession(authOptions);
}

/**
 * Check permission middleware (deprecated - use hasPermission from lib/rbac instead)
 * This function is kept for backward compatibility with existing API routes
 * that haven't been migrated to the new RBAC system yet.
 * 
 * @deprecated Use getSessionUser() and hasPermission() from lib/rbac instead
 */
export function checkPermission(
  apiMethod: BaseApiMethod<CustomRequest>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  module: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  action: string
): BaseApiMethod<CustomRequest> {
  return async (request, context) => {
    const session = await auth();
    
    if (!session || !session.user) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (!session.user.roleName) {
      throw new UnauthorizedException('No Access');
    }

    // Attach user info to request
    // Note: scopeInfo is deprecated and kept only for backward compatibility
    request.scopeInfo = { access: true, scope_name: 'all' };
    request.userInfo = {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.name || '',
      role: session.user.roleName || 'TESTER'
    };

    const response = await apiMethod(request, context);
    return response;
  };
}

/**
 * Main permission wrapper for API routes (deprecated)
 * @deprecated Use getSessionUser() and hasPermission() from lib/rbac instead
 * 
 * Example migration:
 * OLD: export const GET = hasPermission(handler, 'prn', 'r');
 * NEW: 
 * export async function GET(request: NextRequest) {
 *   const user = await getSessionUser();
 *   if (!hasPermission(user, 'projects:read')) {
 *     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 *   }
 *   // ... handler logic
 * }
 */
export const hasPermission = (
  apiMethod: BaseApiMethod<CustomRequest>,
  scope: string,
  action: string
) => baseInterceptor(checkPermission(apiMethod, scope, action));
