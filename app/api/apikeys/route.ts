import { apiKeyController } from '@/backend/controllers/apikey/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

/**
 * POST /api/apikeys
 * Create a new API key
 * Requires: users:read permission (to manage own API keys)
 */
export const POST = hasPermission(
  async (request) => {
    return apiKeyController.createApiKey(request);
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
    return apiKeyController.getUserApiKeys(request);
  },
  'users',
  'read'
);

