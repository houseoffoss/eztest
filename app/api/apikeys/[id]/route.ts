import { apiKeyController } from '@/backend/controllers/apikey/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { NextRequest } from 'next/server';

/**
 * GET /api/apikeys/:id
 * Get API key by ID
 * Requires: users:read permission
 */
export const GET = hasPermission(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return apiKeyController.getApiKeyById(request as any, id);
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
    return apiKeyController.deleteApiKey(request as any, id);
  },
  'users',
  'read'
);

