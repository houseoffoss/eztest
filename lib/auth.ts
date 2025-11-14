import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { prisma } from './prisma';
import { BadRequestException, UnauthorizedException } from '@/backend/utils/exceptions';
import { BaseApiMethod, baseInterceptor } from '@/backend/utils/baseInterceptor';
import { CustomRequest } from '@/backend/utils/interceptor';
import { checkScopeAccess } from '@/backend/helpers/checkScopeAccess';

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

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
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
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Get the current authenticated session
 */
export async function auth() {
  return await getServerSession(authOptions);
}

/**
 * Check permission middleware
 * Verifies user authentication and checks scope-based permissions
 */
export function checkPermission(
  apiMethod: BaseApiMethod<CustomRequest>,
  module: string,
  action: string
): BaseApiMethod<CustomRequest> {
  return async (request, context) => {
    const session = await auth();
    
    if (!session || !session.user) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (!session.user.role) {
      throw new UnauthorizedException('No Access');
    }

    const scope = await checkScopeAccess(session.user.role, module, action);

    if (!scope.access || scope.scope_name === '') {
      throw new UnauthorizedException('Unauthorized');
    }

    // Attach scope info and user info to request
    request.scopeInfo = scope;
    request.userInfo = {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.name || '',
      role: session.user.role as UserRole
    };

    const response = await apiMethod(request, context);
    return response;
  };
}

/**
 * Main permission wrapper for API routes
 * @param apiMethod - The API method to wrap
 * @param scope - The module keyword (e.g., 'prn' for projects)
 * @param action - The action keyword (e.g., 'r' for read, 'w' for write)
 */
export const hasPermission = (
  apiMethod: BaseApiMethod<CustomRequest>,
  scope: string,
  action: string
) => baseInterceptor(checkPermission(apiMethod, scope, action));
