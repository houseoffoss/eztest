import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

interface CreateApiKeyInput {
  userId: string;
  projectId?: string | null;
  name: string;
  expiresAt?: Date | null;
}

interface ApiKeyWithUser {
  id: string;
  name: string;
  keyPrefix: string;
  projectId: string | null;
  project?: {
    id: string;
    name: string;
    key: string;
  } | null;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ApiKeyService {
  /**
   * Generate a new API key
   * Format: ez_<random32chars>
   */
  private generateApiKey(): string {
    const randomPart = randomBytes(16).toString('hex');
    return `ez_${randomPart}`;
  }

  /**
   * Create a new API key for a user
   * Returns the plain text key (only shown once) and the key info
   */
  async createApiKey(data: CreateApiKeyInput): Promise<{ key: string; apiKey: ApiKeyWithUser }> {
    // Generate the API key
    const plainKey = this.generateApiKey();
    const keyPrefix = plainKey.substring(0, 11); // "ez_" + 8 chars

    // Hash the key for storage
    const keyHash = await bcrypt.hash(plainKey, 10);

    // Create the API key record
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: data.userId,
        projectId: data.projectId || null,
        name: data.name,
        keyHash,
        keyPrefix,
        expiresAt: data.expiresAt || null,
        isActive: true,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
      },
    });

    return {
      key: plainKey, // Return plain key only once
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
        projectId: apiKey.projectId,
        project: apiKey.project,
        lastUsedAt: apiKey.lastUsedAt,
        expiresAt: apiKey.expiresAt,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt,
        updatedAt: apiKey.updatedAt,
      },
    };
  }

  /**
   * Verify an API key and return the associated user
   */
  async verifyApiKey(apiKey: string): Promise<{
    userId: string;
    projectId: string | null;
    apiKeyId: string;
  } | null> {
    // Find all active API keys
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: { gt: new Date() } },
          { expiresAt: null },
        ],
      },
      select: {
        id: true,
        userId: true,
        projectId: true,
        keyHash: true,
      },
    });

    // Try to match the key against all active keys
    for (const keyRecord of apiKeys) {
      const isValid = await bcrypt.compare(apiKey, keyRecord.keyHash);
      if (isValid) {
        // Update last used timestamp
        await prisma.apiKey.update({
          where: { id: keyRecord.id },
          data: { lastUsedAt: new Date() },
        });

        return {
          userId: keyRecord.userId,
          projectId: keyRecord.projectId,
          apiKeyId: keyRecord.id,
        };
      }
    }

    return null;
  }

  /**
   * Get all API keys for a user
   */
  async getUserApiKeys(userId: string): Promise<ApiKeyWithUser[]> {
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId,
        // Return all keys (active and inactive) so users can see their history
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return apiKeys.map(key => ({
      id: key.id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      projectId: key.projectId,
      project: key.project,
      lastUsedAt: key.lastUsedAt,
      expiresAt: key.expiresAt,
      isActive: key.isActive,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
    }));
  }

  /**
   * Delete (deactivate) an API key
   */
  async deleteApiKey(apiKeyId: string, userId: string): Promise<void> {
    // Verify the key belongs to the user
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: apiKeyId },
    });

    if (!apiKey) {
      throw new Error('API key not found');
    }

    if (apiKey.userId !== userId) {
      throw new Error('Unauthorized: API key does not belong to user');
    }

    // Soft delete by setting isActive to false
    await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: { isActive: false },
    });
  }

  /**
   * Get API key by ID (for user verification)
   */
  async getApiKeyById(apiKeyId: string, userId: string): Promise<ApiKeyWithUser | null> {
    const apiKey = await prisma.apiKey.findUnique({
      where: {
        id: apiKeyId,
        userId,
        isActive: true,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
      },
    });

    if (!apiKey) {
      return null;
    }

    return {
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      projectId: apiKey.projectId,
      project: apiKey.project,
      lastUsedAt: apiKey.lastUsedAt,
      expiresAt: apiKey.expiresAt,
      isActive: apiKey.isActive,
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt,
    };
  }
}

export const apiKeyService = new ApiKeyService();

