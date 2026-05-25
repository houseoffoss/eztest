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
  testMode: z.enum(["single_turn", "multi_turn", "both"]).default("both"),
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

export const updateAgentTestConfigSchema = createAgentTestConfigSchema.partial().extend({
  testMode: z.enum(["single_turn", "multi_turn", "both"]).optional(),
});

export type CreateAgentTestConfigInput = z.infer<
  typeof createAgentTestConfigSchema
>;
export type UpdateAgentTestConfigInput = z.infer<
  typeof updateAgentTestConfigSchema
>;

// ─── Agent Test Case schemas ──────────────────────────────────────────────────

export const agentTestCaseTurnSchema = z.object({
  turnNumber: z.number().int().positive(),
  userMessage: z.string().min(1, "Turn user message is required"),
  expectedBehavior: z.string().min(1, "Turn expected behavior is required"),
  rubric: z.string().default(""),
});

export const createAgentTestCaseSchema = z
  .object({
    category: z.string().min(1, "Category is required"),
    dimension: z
      .string()
      .optional()
      .transform((val) => (val === "" ? null : val ?? null)),
    title: z.string().min(1, "Title is required").max(200),
    input: z.string().min(1, "Input is required"),
    rubric: z.string().min(1, "Rubric is required"),
    expectedBehavior: z.string().min(1, "Expected behavior is required"),
    turns: z
      .union([z.array(agentTestCaseTurnSchema), z.null(), z.undefined()])
      .transform((val) => {
        if (!val || val.length === 0) return null;
        return JSON.stringify(val);
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.category === "multi_turn") {
      const hasTurns =
        data.turns !== null &&
        data.turns !== undefined &&
        data.turns !== "null";
      if (!hasTurns) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Multi-turn test cases must have at least one follow-up turn defined",
          path: ["turns"],
        });
      }
    }
  });

export const updateAgentTestCaseSchema = z.object({
  category: z.string().min(1).optional(),
  dimension: z
    .string()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  title: z.string().min(1).max(200).optional(),
  input: z.string().min(1).optional(),
  rubric: z.string().min(1).optional(),
  expectedBehavior: z.string().min(1).optional(),
  turns: z
    .union([z.array(agentTestCaseTurnSchema), z.null(), z.undefined()])
    .transform((val) => {
      if (val === undefined) return undefined;
      if (!val || val.length === 0) return null;
      return JSON.stringify(val);
    })
    .optional(),
});

export type CreateAgentTestCaseInput = z.infer<typeof createAgentTestCaseSchema>;
export type UpdateAgentTestCaseInput = z.infer<typeof updateAgentTestCaseSchema>;
