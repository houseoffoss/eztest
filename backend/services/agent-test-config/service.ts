import { prisma } from "@/lib/prisma";
import {
  NotFoundException,
  ValidationException,
} from "@/backend/utils/exceptions";
import {
  createAgentTestConfigSchema,
  updateAgentTestConfigSchema,
} from "@/backend/validators/agent-test-config.validator";

// Fields returned to the client — never expose aiApiKey or langfuseSecretKey
const CONFIG_SELECT = {
  id: true,
  name: true,
  agentApiUrl: true,
  langfusePublicKey: true,
  systemPrompt: true,
  aiProvider: true,
  aiModel: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class AgentTestConfigService {
  async list(userId: string) {
    return prisma.agentTestConfig.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: "desc" },
      select: CONFIG_SELECT,
    });
  }

  async getById(id: string, userId: string) {
    const config = await prisma.agentTestConfig.findFirst({
      where: { id, createdById: userId },
      select: CONFIG_SELECT,
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
      aiProvider,
      aiModel,
      aiApiKey,
    } = result.data;
    return prisma.agentTestConfig.create({
      data: {
        name,
        agentApiUrl,
        langfusePublicKey,
        langfuseSecretKey,
        systemPrompt,
        aiProvider,
        aiModel: aiModel ?? null,
        aiApiKey,
        createdById: userId,
      },
      select: CONFIG_SELECT,
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
      select: CONFIG_SELECT,
    });
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId); // ensure exists and belongs to user
    await prisma.agentTestConfig.delete({ where: { id } });
  }
}

export const agentTestConfigService = new AgentTestConfigService();
