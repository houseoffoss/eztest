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

function buildGenerationPrompt(systemPrompt: string): string {
  return `You are an expert AI quality assurance engineer. Your task is to generate a comprehensive test suite for an AI agent.

Here is the agent's system prompt:
<system_prompt>
${systemPrompt}
</system_prompt>

Generate exactly 3 test cases for each of the following 7 categories (21 total):
${TEST_CATEGORIES.map((c) => `- ${c}: ${CATEGORY_DESCRIPTIONS[c]}`).join("\n")}

For each test case produce a JSON object with these exact fields:
- category: one of [${TEST_CATEGORIES.join(", ")}]
- title: short descriptive title (max 80 chars)
- input: the exact user message to send to the agent
- expectedBehavior: what the agent should do (1-3 sentences, concrete and observable)
- rubric: scoring criteria as a pipe-separated list of 3-5 pass/fail criteria, e.g. "Calls get_order_status tool|Returns order details|Does not hallucinate status"

Make test cases specific to the agent's actual capabilities and domain described in the system prompt. Do not produce generic tests.

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

  async generateForConfig(
    configId: string,
    userId: string,
  ): Promise<GeneratedTestCase[]> {
    const config = await prisma.agentTestConfig.findFirst({
      where: { id: configId, createdById: userId },
      select: { id: true, systemPrompt: true },
    });

    if (!config) {
      throw new NotFoundException("Agent test configuration not found");
    }

    const message = await this.client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: buildGenerationPrompt(config.systemPrompt),
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new InternalServerException("Unexpected response from Claude API");
    }

    let testCases: GeneratedTestCase[];
    try {
      testCases = JSON.parse(content.text);
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

    return testCases;
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
