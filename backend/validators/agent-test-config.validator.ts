import { z } from "zod";

export const createAgentTestConfigSchema = z.object({
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
  aiModel: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  aiApiKey: z.string().min(1, "AI API key is required").trim(),
  cookies: z
    .union([z.string(), z.undefined(), z.null()])
    .transform((val) => {
      if (!val || val === "") return null;
      return val;
    })
    .refine(
      (val) => {
        if (!val) return true;
        try {
          const parsed = JSON.parse(val);
          return (
            Array.isArray(parsed) &&
            parsed.every(
              (c) =>
                typeof c === "object" &&
                typeof c.name === "string" &&
                typeof c.value === "string",
            )
          );
        } catch {
          return false;
        }
      },
      "Cookies must be a valid JSON array with {name, value} objects",
    ),
  authHeaders: z
    .union([z.string(), z.undefined(), z.null()])
    .transform((val) => {
      if (!val || val === "") return null;
      return val;
    })
    .refine(
      (val) => {
        if (!val) return true;
        try {
          const parsed = JSON.parse(val);
          return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
        } catch {
          return false;
        }
      },
      "Auth headers must be a valid JSON object (e.g., {\"Authorization\": \"Bearer token\"})",
    ),
});

export const updateAgentTestConfigSchema =
  createAgentTestConfigSchema.partial();

export type CreateAgentTestConfigInput = z.infer<
  typeof createAgentTestConfigSchema
>;
export type UpdateAgentTestConfigInput = z.infer<
  typeof updateAgentTestConfigSchema
>;
