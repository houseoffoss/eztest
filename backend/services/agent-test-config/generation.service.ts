import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
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

function buildGenerationPrompt(
  agentDescription: string,
  chatUrl: string,
): string {
  return `You are an expert AI quality assurance engineer. Your task is to generate a comprehensive test suite for an AI agent.

The agent's chat endpoint is: ${chatUrl}

Here is a full description of the agent — this may include its role, available tools, skills, API endpoints, supported models, or any other details provided by the developer:
<agent_description>
${agentDescription}
</agent_description>

## Step 1 — Extract agent capabilities

Before generating any test cases, carefully read the description and identify:
- The agent's primary domain and purpose
- EVERY tool the agent has available (list each by its exact name as mentioned in the description)
- EVERY skill the agent has available (list each by its exact name)
- Any constraints, refusal policies, or out-of-scope behaviours
- Expected input/output patterns

## Step 2 — Generate test cases

Generate test cases for each of the following 7 categories:
${TEST_CATEGORIES.map((c) => `- ${c}: ${CATEGORY_DESCRIPTIONS[c]}`).join("\n")}

### Tool and skill coverage rules (MANDATORY)
- Every tool and skill identified in Step 1 MUST appear in at least one test case's rubric criterion using its exact name (e.g. "Calls <tool_name> tool").
- The \`tool_use\` category must contain one test case per tool/skill, up to a maximum of 5. If there are more than 5 tools/skills, cover the 5 most important ones in \`tool_use\` and ensure the remaining ones appear in rubric criteria of other categories.
- In the rubric for ANY category, if the correct agent behavior involves calling a specific tool, name that tool explicitly (e.g. "Calls search_web tool|Returns results from tool output").

### Category quotas
- \`tool_use\`: exactly max(3, number_of_tools_and_skills) cases, up to a maximum of 5
- All other categories: exactly 3 cases each
- Minimum total: 21 test cases

### Per test case fields
- category: one of [${TEST_CATEGORIES.join(", ")}]
- title: short descriptive title (max 80 chars)
- input: the exact user message to send to the agent
- expectedBehavior: what the agent should do (1-3 sentences, concrete and observable)
- rubric: scoring criteria as a pipe-separated list of 3-5 pass/fail criteria — always name the specific tool or skill when tool invocation is expected, e.g. "Calls get_order_status tool|Returns order details|Does not hallucinate status"

Make every test case specific to the agent's actual capabilities. Reference real tool names, skill names, and domain concepts from the description. Do not produce generic tests.

Respond with a JSON array only — no markdown, no explanation, no wrapper object. Example format:
[{"category":"happy_path","title":"...","input":"...","expectedBehavior":"...","rubric":"..."}]`;
}

export class AgentTestGenerationService {
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new InternalServerException(
        "ANTHROPIC_API_KEY environment variable is not set",
      );
    }
    this.client = new Anthropic({ apiKey });
  }

  async generateForConfig(configId: string, userId: string) {
    const config = await prisma.agentTestConfig.findFirst({
      where: { id: configId, createdById: userId },
      select: { id: true, systemPrompt: true, agentApiUrl: true },
    });

    if (!config) {
      throw new NotFoundException("Agent test configuration not found");
    }

    const chatUrl = config.agentApiUrl.replace(/\/+$/, "") + "/api/chat";

    let message: Awaited<ReturnType<typeof this.client.messages.create>>;
    try {
      message = await this.client.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 8192,
        messages: [
          {
            role: "user",
            content: buildGenerationPrompt(config.systemPrompt, chatUrl),
          },
        ],
      });
    } catch (err: unknown) {
      if (err instanceof Anthropic.APIError) {
        if (err.status === 400 && err.message.includes("content filtering")) {
          throw new InternalServerException(
            "Test case generation was blocked by content filtering. Your agent description may contain content that triggers safety filters. Try rephrasing your system prompt and regenerate.",
          );
        }
        throw new InternalServerException(
          `Claude API error (${err.status}): ${err.message}`,
        );
      }
      throw new InternalServerException(
        "Unexpected error while calling Claude API",
      );
    }

    const content = message.content[0];
    if (content.type !== "text") {
      throw new InternalServerException("Unexpected response from Claude API");
    }

    let testCases: GeneratedTestCase[];
    try {
      // Strip markdown code fences if Claude wraps response despite instructions
      const raw = content.text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
      testCases = JSON.parse(raw);
    } catch {
      throw new InternalServerException(
        "Failed to parse test cases from Claude response",
      );
    }

    if (!Array.isArray(testCases) || testCases.length === 0) {
      throw new InternalServerException("Claude returned no test cases");
    }

    // Delete previous generation for this config before saving new ones
    await prisma.agentTestCase.deleteMany({ where: { configId } });

    await prisma.agentTestCase.createMany({
      data: testCases.map((tc) => ({
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
}

export const agentTestGenerationService = new AgentTestGenerationService();
