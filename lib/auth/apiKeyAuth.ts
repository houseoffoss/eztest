import { NextRequest } from 'next/server';
import { apiKeyService } from '@/backend/services/apikey/services';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from './getSessionUser';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: {
    name: string;
    permissions: Array<{
      permission: {
        name: string;
      };
    }>;
  };
  projectId?: string | null; // If API key is scoped to a project
}

/**
 * Extract API key from Authorization header
 * Supports both "Bearer <key>" and "ApiKey <key>" formats
 */
export function extractApiKey(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return null;
  }

  // Support both "Bearer" and "ApiKey" prefixes
  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return null;
  }

  const [prefix, key] = parts;
  if (prefix.toLowerCase() === 'bearer' || prefix.toLowerCase() === 'apikey') {
    return key;
  }

  return null;
}

/**
 * Authenticate using API key
 * Returns the authenticated user or null
 */
export async function authenticateWithApiKey(apiKey: string): Promise<AuthenticatedUser | null> {
  const keyInfo = await apiKeyService.verifyApiKey(apiKey);
  
  if (!keyInfo) {
    return null;
  }

  // Fetch user with role and permissions
  const user = await prisma.user.findUnique({
    where: { id: keyInfo.userId },
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

  if (!user || user.deletedAt) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    projectId: keyInfo.projectId,
  };
}

/**
 * Authenticate request using either session or API key
 * Returns the authenticated user or null
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedUser | null> {
  // First try API key authentication
  const apiKey = extractApiKey(request);
  if (apiKey) {
    return await authenticateWithApiKey(apiKey);
  }

  // Fall back to session authentication
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return null;
  }

  return {
    id: sessionUser.id,
    email: sessionUser.email,
    name: sessionUser.name,
    role: sessionUser.role,
  };
}

