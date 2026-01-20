import { apiKeyController } from '@/backend/controllers/apikey/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/apikeys/:id
 * Get API key by ID
 * Requires: users:read permission
 */
export const GET = hasPermission(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const result = await apiKeyController.getApiKeyById(request as any, id);
    return NextResponse.json(result.data, { status: result.statusCode });
  },
  'users',
  'read'
);

/**
 * DELETE /api/apikeys/:id
 * Delete (deactivate) an API key
 * Requires: users:read permission
 */
export const DELETE = hasPermission(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const result = await apiKeyController.deleteApiKey(request as any, id);
    return NextResponse.json({ message: result.message }, { status: result.statusCode });
  },
  'users',
  'read'
);

