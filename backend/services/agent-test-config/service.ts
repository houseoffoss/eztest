import { prisma } from "@/lib/prisma";
import {
  NotFoundException,
  ValidationException,
} from "@/backend/utils/exceptions";
import {
  createAgentTestConfigSchema,
  updateAgentTestConfigSchema,
} from "@/backend/validators/agent-test-config.validator";

export class AgentTestConfigService {
  async list(userId: string) {
    return prisma.agentTestConfig.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        agentApiUrl: true,
        langfusePublicKey: true,
        systemPrompt: true,
        createdAt: true,
        updatedAt: true,
        // langfuseSecretKey intentionally excluded from list responses
      },
    });
  }

  async getById(id: string, userId: string) {
    const config = await prisma.agentTestConfig.findFirst({
      where: { id, createdById: userId },
      select: {
        id: true,
        name: true,
        agentApiUrl: true,
        langfusePublicKey: true,
        systemPrompt: true,
        createdAt: true,
        updatedAt: true,
        // langfuseSecretKey intentionally excluded from read responses
      },
    });
    if (!config)
      throw new NotFoundException("Agent test configuration not found");
    return config;
  }

  async create(data: unknown, userId: string) {
    const result = createAgentTestConfigSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationException("Validation failed", result.error.issues);
    }
    const {
      name,
      agentApiUrl,
      langfusePublicKey,
      langfuseSecretKey,
      systemPrompt,
    } = result.data;
    return prisma.agentTestConfig.create({
      data: {
        name,
        agentApiUrl,
        langfusePublicKey,
        langfuseSecretKey,
        systemPrompt,
        createdById: userId,
      },
      select: {
        id: true,
        name: true,
        agentApiUrl: true,
        langfusePublicKey: true,
        systemPrompt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: string, data: unknown, userId: string) {
    const result = updateAgentTestConfigSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationException("Validation failed", result.error.issues);
    }
    await this.getById(id, userId); // ensure exists and belongs to user
    return prisma.agentTestConfig.update({
      where: { id },
      data: result.data,
      select: {
        id: true,
        name: true,
        agentApiUrl: true,
        langfusePublicKey: true,
        systemPrompt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId); // ensure exists and belongs to user
    await prisma.agentTestConfig.delete({ where: { id } });
  }
}

export const agentTestConfigService = new AgentTestConfigService();
