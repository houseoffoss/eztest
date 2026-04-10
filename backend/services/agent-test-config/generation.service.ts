import { prisma } from "@/lib/prisma";
import { callAi, getEnvDefaults, type AiProvider } from "@/lib/ai-provider";
import {
  NotFoundException,
  InternalServerException,
} from "@/backend/utils/exceptions";

const TEST_CATEGORIES = [
  "happy_path",
  "edge_case",
  "tool_use",
  "refusal",
  "ambiguity",
  "multi_turn",
  "regression",
] as const;

export type TestCategory = (typeof TEST_CATEGORIES)[number];

export interface GeneratedTestCase {
  category: TestCategory;
  title: string;
  input: string;
  rubric: string;
  expectedBehavior: string;
}

export interface ApiContract {
  chatPath: string;
  sessionStartPath: string | null;
  requestBody: Record<string, string>;
  headers: Record<string, string>;
}

export interface GenerationResult {
  apiContract: ApiContract;
  testCases: GeneratedTestCase[];
}

const CATEGORY_DESCRIPTIONS: Record<TestCategory, string> = {
  happy_path:
    "Standard, well-formed requests the agent should handle correctly",
  edge_case: "Boundary conditions, unusual inputs, or rare but valid scenarios",
  tool_use:
    "Requests that require the agent to invoke its available tools correctly",
  refusal:
    "Requests the agent should decline (out-of-scope, harmful, policy violations)",
  ambiguity:
    "Vague or underspecified requests requiring the agent to ask for clarification",
  multi_turn: "Scenarios requiring multiple conversation turns to resolve",
  regression: "Common failure patterns agents typically struggle with",
};

function buildGenerationPrompt(agentDescription: string): string {
  return `You are an expert AI quality assurance engineer. Your task is to analyse an agent description and produce two things: the agent's API contract and a comprehensive test suite.

Here is a full description of the agent — this may include its role, available tools, skills, API endpoints, request/response formats, auth headers, supported models, or any other details provided by the developer:
<agent_description>
${agentDescription}
</agent_description>

## Step 1 — Extract the API contract

Read the description carefully and extract ONLY what is explicitly stated. Do not assume or invent values. Extract:

- \`chatPath\`: the URL path to send chat/query messages to (e.g. "/api/chat", "/v1/ask"). Extract exactly as described.
- \`sessionStartPath\`: the URL path to start a session before chatting, if mentioned. Set to null if not mentioned.
- \`requestBody\`: the exact request body shape as a flat key-value object. For the field that carries the user message, use the placeholder \`{{input}}\`. For the session/conversation ID field, use \`{{sessionId}}\`. For any other dynamic value described (e.g. model name, user ID), use the exact value from the description as a string. Only include fields that are explicitly described.
- \`headers\`: any HTTP headers required (e.g. Authorization, API keys). Use exact values from the description. If no headers are described, return an empty object.

## Step 2 — Extract agent capabilities

Identify:
- The agent's primary domain and purpose
- EVERY tool the agent has available (exact names)
- EVERY skill the agent has available (exact names)
- Any constraints, refusal policies, or out-of-scope behaviours

## Step 3 — Generate test cases

Generate test cases for each of the following 7 categories:
${TEST_CATEGORIES.map((c) => `- ${c}: ${CATEGORY_DESCRIPTIONS[c]}`).join("\n")}

### Tool and skill coverage rules (MANDATORY)
- Every tool and skill MUST appear in at least one test case's rubric criterion using its exact name (e.g. "Calls <tool_name> tool").
- The \`tool_use\` category must contain one test case per tool/skill, up to a maximum of 5.
- In the rubric for ANY category, if the correct agent behavior involves calling a specific tool, name that tool explicitly.

### Category quotas
- \`tool_use\`: exactly max(3, number_of_tools_and_skills) cases, up to a maximum of 5
- All other categories: exactly 3 cases each
- Minimum total: 21 test cases

### Per test case fields
- category: one of [${TEST_CATEGORIES.join(", ")}]
- title: short descriptive title (max 80 chars)
- input: the exact user message to send to the agent — must be compatible with the \`{{input}}\` field in the extracted requestBody
- expectedBehavior: what the agent should do (1-3 sentences, concrete and observable)
- rubric: scoring criteria as a pipe-separated list of 3-5 pass/fail criteria

Make every test case specific to the agent's actual capabilities. Reference real tool names, skill names, and domain concepts from the description. Do not produce generic tests.

## Output format

Respond with a single JSON object only — no markdown, no explanation. Exact format:
{
  "apiContract": {
    "chatPath": "...",
    "sessionStartPath": "..." or null,
    "requestBody": { "key": "value or {{input}} or {{sessionId}}" },
    "headers": { "HeaderName": "value" }
  },
  "testCases": [
    {"category":"happy_path","title":"...","input":"...","expectedBehavior":"...","rubric":"..."}
  ]
}`;
}

export class AgentTestGenerationService {
  async generateForConfig(configId: string, userId: string) {
    const config = await prisma.agentTestConfig.findFirst({
      where: { id: configId, createdById: userId },
      select: {
        id: true,
        systemPrompt: true,
        aiProvider: true,
        aiModel: true,
        aiApiKey: true,
      },
    });

    if (!config) {
      throw new NotFoundException("Agent test configuration not found");
    }

    const envDefaults = getEnvDefaults();
    const provider = (config.aiProvider ?? envDefaults.provider) as AiProvider;
    const apiKey = config.aiApiKey ?? envDefaults.apiKey ?? "";
    const model = config.aiModel ?? envDefaults.model ?? undefined;

    if (!apiKey) {
      throw new InternalServerException(
        provider === "google"
          ? "Google AI API key is not configured. Set it on the config or via GOOGLE_API_KEY env var."
          : "Anthropic API key is not configured. Set it on the config or via ANTHROPIC_API_KEY env var.",
      );
    }

    const rawText = await callAi({
      provider,
      apiKey,
      purpose: "generation",
      model,
      messages: [
        {
          role: "user",
          content: buildGenerationPrompt(config.systemPrompt),
        },
      ],
    });

    let parsed: GenerationResult;
    try {
      // Strip markdown code fences if the model wraps response despite instructions
      const raw = rawText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
      parsed = JSON.parse(raw);
    } catch {
      throw new InternalServerException(
        "Failed to parse generation response from AI provider",
      );
    }

    if (
      !parsed.apiContract ||
      !Array.isArray(parsed.testCases) ||
      parsed.testCases.length === 0
    ) {
      throw new InternalServerException(
        "AI provider returned an incomplete generation response",
      );
    }

    // Persist the extracted API contract on the config
    await prisma.agentTestConfig.update({
      where: { id: configId },
      data: { apiContract: JSON.stringify(parsed.apiContract) },
    });

    // Delete previous generation for this config before saving new ones
    await prisma.agentTestCase.deleteMany({ where: { configId } });

    await prisma.agentTestCase.createMany({
      data: parsed.testCases.map((tc) => ({
        configId,
        category: tc.category,
        title: tc.title,
        input: tc.input,
        rubric: tc.rubric,
        expectedBehavior: tc.expectedBehavior,
      })),
    });

    return prisma.agentTestCase.findMany({
      where: { configId },
      orderBy: { generatedAt: "asc" },
    });
  }

  async getTestCases(configId: string, userId: string) {
    const config = await prisma.agentTestConfig.findFirst({
      where: { id: configId, createdById: userId },
      select: { id: true },
    });

    if (!config) {
      throw new NotFoundException("Agent test configuration not found");
    }

    return prisma.agentTestCase.findMany({
      where: { configId },
      orderBy: { generatedAt: "asc" },
    });
  }

  async createTestCase(
    configId: string,
    userId: string,
    data: {
      category: string;
      title: string;
      input: string;
      rubric: string;
      expectedBehavior: string;
    },
  ) {
    const config = await prisma.agentTestConfig.findFirst({
      where: { id: configId, createdById: userId },
      select: { id: true },
    });
    if (!config) throw new NotFoundException("Agent test configuration not found");

    return prisma.agentTestCase.create({
      data: {
        configId,
        category: data.category,
        title: data.title,
        input: data.input,
        rubric: data.rubric,
        expectedBehavior: data.expectedBehavior,
      },
    });
  }

  async updateTestCase(
    testCaseId: string,
    userId: string,
    data: Partial<{
      category: string;
      title: string;
      input: string;
      rubric: string;
      expectedBehavior: string;
    }>,
  ) {
    // Verify the test case belongs to a config owned by this user
    const testCase = await prisma.agentTestCase.findFirst({
      where: { id: testCaseId },
      include: { config: { select: { createdById: true } } },
    });
    if (!testCase || testCase.config.createdById !== userId) {
      throw new NotFoundException("Test case not found");
    }

    return prisma.agentTestCase.update({
      where: { id: testCaseId },
      data,
    });
  }

  async deleteTestCase(testCaseId: string, userId: string) {
    const testCase = await prisma.agentTestCase.findFirst({
      where: { id: testCaseId },
      include: { config: { select: { createdById: true } } },
    });
    if (!testCase || testCase.config.createdById !== userId) {
      throw new NotFoundException("Test case not found");
    }

    await prisma.agentTestCase.delete({ where: { id: testCaseId } });
  }
}

export const agentTestGenerationService = new AgentTestGenerationService();
