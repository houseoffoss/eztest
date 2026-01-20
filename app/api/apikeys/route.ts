import { apiKeyController } from '@/backend/controllers/apikey/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { NextResponse } from 'next/server';

/**
 * POST /api/apikeys
 * Create a new API key
 * Requires: users:read permission (to manage own API keys)
 */
export const POST = hasPermission(
  async (request) => {
    const result = await apiKeyController.createApiKey(request);
    return NextResponse.json(result.data, { status: result.statusCode });
  },
  'users',
  'read'
);

/**
 * GET /api/apikeys
 * Get all API keys for the current user
 * Requires: users:read permission
 */
export const GET = hasPermission(
  async (request) => {
    const result = await apiKeyController.getUserApiKeys(request);
    return NextResponse.json(result.data, { status: result.statusCode });
  },
  'users',
  'read'
);

