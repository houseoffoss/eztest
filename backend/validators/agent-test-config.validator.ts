import { z } from "zod";

export const createAgentTestConfigSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(255, "Name must not exceed 255 characters")
      .trim(),
    agentApiUrl: z.string().url("Agent API URL must be a valid URL").trim(),
    langfusePublicKey: z
      .string()
      .min(1, "Langfuse public key is required")
      .trim(),
    langfuseSecretKey: z
      .string()
      .min(1, "Langfuse secret key is required")
      .trim(),
    systemPrompt: z.string().min(1, "System prompt is required"),
    aiProvider: z.enum(["anthropic", "google"]).default("anthropic"),
    aiModel: z.string().trim().optional(),
    aiApiKey: z.string().min(1, "AI API key is required").trim(),
    agentAuthType: z
      .enum(["none", "bearer", "apikey", "cookie"])
      .default("none"),
    agentAuthKey: z.string().trim().optional(),
    agentAuthValue: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (data.agentAuthType === "apikey" || data.agentAuthType === "cookie") {
        return !!data.agentAuthKey && data.agentAuthKey.length > 0;
      }
      return true;
    },
    {
      message: "Header/cookie name is required for this auth type",
      path: ["agentAuthKey"],
    },
  );

export const updateAgentTestConfigSchema =
  createAgentTestConfigSchema.partial();

export type CreateAgentTestConfigInput = z.infer<
  typeof createAgentTestConfigSchema
>;
export type UpdateAgentTestConfigInput = z.infer<
  typeof updateAgentTestConfigSchema
>;
