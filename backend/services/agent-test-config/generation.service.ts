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
  return `You are a senior AI quality assurance engineer specialising in LLM agent evaluation. Your task is to analyse an agent description and produce two things: the agent's API contract and a high-quality, executable test suite.

Here is the full description of the agent — this may include its role, available tools, skills, API endpoints, request/response formats, auth headers, supported models, or any other details provided by the developer:
<agent_description>
${agentDescription}
</agent_description>

---

## Step 1 — Extract the API contract

Read the description carefully and extract ONLY what is explicitly stated. Do NOT assume or invent values.

- \`chatPath\`: URL path to send chat/query messages to (e.g. "/api/chat", "/v1/ask"). Copy exactly as written.
- \`sessionStartPath\`: URL path to initialise a session before chatting, if mentioned. Set to null if not mentioned.
- \`requestBody\`: the exact request body shape as a flat key→value object.
  - Use \`{{input}}\` for the field that carries the user message.
  - Use \`{{sessionId}}\` for the session/conversation ID field.
  - Use the literal value from the description for all other fields (model name, user ID, etc.).
  - Include ONLY fields that are explicitly described.
- \`headers\`: HTTP headers required (e.g. Authorization, API keys). Use exact values. Return \`{}\` if none are described.

---

## Step 2 — Extract agent capabilities

Before writing any test, identify:

1. **Primary domain and purpose** — one sentence describing what this agent does.
2. **Every tool** the agent can call — list exact names as they appear in the description.
3. **Every skill** the agent has — list exact names.
4. **Hard constraints and refusal policies** — topics, actions, or request types the agent must decline.
5. **Known failure modes** — any fragile behaviours, known edge cases, or caveats mentioned by the developer.

---

## Step 3 — Generate test cases

Generate test cases across the following 7 categories:
${TEST_CATEGORIES.map((c) => `- **${c}**: ${CATEGORY_DESCRIPTIONS[c]}`).join("\n")}

### Category quotas (STRICT)
- \`tool_use\`: one test case per distinct tool or skill (no cap). Every tool and skill must have its own dedicated test case.
- All other categories: at least 3 cases each. Generate as many as the agent's complexity justifies — more capabilities, more domain concepts, more constraints = more test cases.
- **There is no upper limit. Cover the agent thoroughly. Do not stop early.**

### Tool and skill coverage (MANDATORY)
- Every tool and every skill MUST be named explicitly in at least one rubric criterion (e.g. "Calls the \`search_web\` tool").
- Each \`tool_use\` test case must target a single, distinct tool or skill.
- In any category, if the correct response requires calling a specific tool, name that tool in the rubric.

### Input quality rules
- Each \`input\` must be a realistic, natural-language message a real user would send — no meta-commentary, no placeholders.
- Vary phrasing across test cases. Do not reuse the same sentence structure.
- For \`multi_turn\` tests, the \`input\` represents the **opening message** of the conversation. In \`expectedBehavior\`, describe the full intended multi-turn flow (e.g. "User asks X → agent clarifies Y → user provides Y → agent returns Z").
- For \`refusal\` tests, craft inputs that are genuinely boundary-pushing — not obviously off-topic, but close enough to the agent's domain to require a deliberate policy decision.
- For \`ambiguity\` tests, the input must be underspecified in a way that has multiple plausible interpretations relevant to the agent's domain.
- For \`regression\` tests, target real failure modes: instruction-following breakdown, hallucination of tool outputs, losing context mid-conversation, ignoring user constraints, over-refusal, etc.

### Rubric quality rules (CRITICAL)
The rubric is the only mechanism used to score the agent. Vague criteria produce useless scores.

**Each rubric criterion MUST be:**
- A specific, binary pass/fail statement a third-party evaluator can check from the response text alone.
- Grounded in the agent's actual output — what it says, what it does NOT say, whether it called a tool, whether it asked a question, etc.
- Free of subjective language like "appropriate", "good", "correct", or "reasonable".

**Good rubric examples:**
- "Response contains a numbered step-by-step plan with at least 3 steps"
- "Calls the \`get_weather\` tool with a city parameter matching the user's request"
- "Response does not mention or attempt to answer questions about competitor products"
- "Asks the user at least one clarifying question before providing a recommendation"
- "Response includes a disclaimer that it cannot access real-time data"

**Bad rubric examples (DO NOT USE):**
- "Responds correctly" — not verifiable
- "Provides a helpful answer" — subjective
- "Handles the request well" — meaningless
- "Uses the tool appropriately" — does not name the tool or describe what 'appropriate' means

Each test case must have 3–5 rubric criteria separated by " | " (space-pipe-space).

### Per test case fields
- \`category\`: one of [${TEST_CATEGORIES.join(", ")}]
- \`title\`: short, descriptive, and unique — max 80 characters. No generic titles like "Happy path test 1".
- \`input\`: the exact user message to send — realistic, natural language, no placeholders.
- \`expectedBehavior\`: 2–4 sentences describing the ideal agent response in observable, concrete terms. State what the agent should say, do, call, or avoid.
- \`rubric\`: 3–5 specific binary pass/fail criteria separated by " | ".

---

## Output format

Respond with a single valid JSON object — no markdown fences, no prose, no explanation. Use this exact structure:
{
  "apiContract": {
    "chatPath": "...",
    "sessionStartPath": "..." or null,
    "requestBody": { "key": "value or {{input}} or {{sessionId}}" },
    "headers": { "HeaderName": "value" }
  },
  "testCases": [
    {
      "category": "happy_path",
      "title": "Descriptive unique title",
      "input": "Realistic user message here",
      "expectedBehavior": "The agent should... (2-4 sentences, observable and concrete)",
      "rubric": "Criterion one | Criterion two | Criterion three"
    }
  ]
}`;
}

/**
 * Extract the first valid JSON object from a model response string.
 * Handles markdown code fences, leading/trailing prose, and extra whitespace.
 */
function extractJson(raw: string): GenerationResult {
  // 1. Try direct parse first (model obeyed instructions)
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through
  }

  // 2. Strip a single markdown code fence wrapping the whole response
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1]);
    } catch {
      // fall through to brace extraction
    }
  }

  // 3. Extract the first {...} block from the response (handles leading prose)
  const braceStart = trimmed.indexOf("{");
  const braceEnd = trimmed.lastIndexOf("}");
  if (braceStart !== -1 && braceEnd > braceStart) {
    return JSON.parse(trimmed.slice(braceStart, braceEnd + 1));
  }

  throw new Error("No JSON object found in response");
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
      maxTokens: 16000,
      messages: [
        {
          role: "user",
          content: buildGenerationPrompt(config.systemPrompt),
        },
      ],
    });

    let parsed: GenerationResult;
    try {
      parsed = extractJson(rawText);
    } catch (parseErr) {
      console.error(
        "[generation] JSON parse failed. Raw AI response (first 2000 chars):\n",
        rawText?.slice(0, 2000),
      );
      console.error("[generation] Parse error:", parseErr);
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
    if (!config)
      throw new NotFoundException("Agent test configuration not found");

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
