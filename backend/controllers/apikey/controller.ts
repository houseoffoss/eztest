import { apiKeyService } from '@/backend/services/apikey/services';
import { CustomRequest } from '@/backend/utils/interceptor';
import { NotFoundException, ValidationException } from '@/backend/utils/exceptions';
import { z } from 'zod';

// Validation schemas
const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  projectId: z.string().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable().transform((val) => val ? new Date(val) : null),
});

export class ApiKeyController {
  /**
   * Create a new API key
   */
  async createApiKey(req: CustomRequest) {
    const userId = req.userInfo.id;
    const body = await req.json();

    // Validation with Zod
    const validationResult = createApiKeySchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Invalid API key data',
        validationResult.error.issues
      );
    }

    // If projectId is provided, verify the user has access to it
    if (validationResult.data.projectId) {
      // This will be checked in the service or we can add a check here
      // For now, we'll let the service handle it
    }

    const result = await apiKeyService.createApiKey({
      userId,
      projectId: validationResult.data.projectId || null,
      name: validationResult.data.name,
      expiresAt: validationResult.data.expiresAt || null,
    });

    return {
      data: {
        key: result.key, // Plain key shown only once
        apiKey: result.apiKey,
      },
      message: 'API key created successfully. Please save the key securely - it will not be shown again.',
    };
  }

  /**
   * Get all API keys for the current user
   */
  async getUserApiKeys(req: CustomRequest) {
    const userId = req.userInfo.id;

    const apiKeys = await apiKeyService.getUserApiKeys(userId);

    return {
      data: apiKeys,
    };
  }

  /**
   * Delete an API key
   */
  async deleteApiKey(req: CustomRequest, apiKeyId: string) {
    const userId = req.userInfo.id;

    try {
      await apiKeyService.deleteApiKey(apiKeyId, userId);
      return {
        message: 'API key deleted successfully',
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'API key not found') {
          throw new NotFoundException(error.message);
        }
        if (error.message.includes('Unauthorized')) {
          throw new ValidationException(error.message);
        }
      }
      throw error;
    }
  }

  /**
   * Get API key by ID
   */
  async getApiKeyById(req: CustomRequest, apiKeyId: string) {
    const userId = req.userInfo.id;

    const apiKey = await apiKeyService.getApiKeyById(apiKeyId, userId);

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    return {
      data: apiKey,
    };
  }
}

export const apiKeyController = new ApiKeyController();

