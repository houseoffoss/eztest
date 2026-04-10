// ─── Shared types for Agent Testing (used by both frontend and API layers) ────

export type AiProvider = "anthropic" | "google";

export const AI_PROVIDER_LABELS: Record<AiProvider, string> = {
  anthropic: "Anthropic (Claude)",
  google: "Google AI Studio (Gemini)",
};

export interface AgentTestConfig {
  id: string;
  name: string;
  agentApiUrl: string;
  langfusePublicKey: string;
  systemPrompt: string;
  aiProvider: AiProvider;
  createdAt: string;
  updatedAt: string;
}

export interface AgentTestCase {
  id: string;
  configId: string;
  category: string;
  title: string;
  input: string;
  rubric: string;
  expectedBehavior: string;
  generatedAt: string;
}

export interface RubricScore {
  criterion: string;
  pass: boolean;
  reason: string;
}

export interface AgentTestResultSummary {
  id: string;
  testCaseId: string;
  sessionId: string;
  status: "pending" | "success" | "error";
  agentResponse: string | null;
  httpStatus: number | null;
  latencyMs: number | null;
  errorMessage: string | null;
  executedAt: string;
  // Langfuse
  langfuseTraceId: string | null;
  traceFetchedAt: string | null;
  traceFetchError: string | null;
  traceJson: string | null;
  // Scoring
  rubricScores: string | null; // JSON-serialised RubricScore[]
  passCount: number | null;
  failCount: number | null;
  scoredAt: string | null;
  scoreError: string | null;
  testCase: {
    title: string;
    category: string;
    input: string;
    expectedBehavior: string;
    rubric: string;
  };
}

export interface AgentTestRunState {
  runId: string;
  configId?: string;
  configName?: string;
  agentApiUrl?: string;
  status: "pending" | "running" | "completed" | "failed";
  totalCases: number;
  completedCases: number;
  startedAt: string;
  completedAt: string | null;
  results: AgentTestResultSummary[];
  // AQS (populated after completion)
  aqsScore: number | null;
  aqsCorrectness: number | null;
  aqsToolUse: number | null;
  aqsLatency: number | null;
  aqsErrorRate: number | null;
  aqsTraceCoverage: number | null;
  aqsComputedAt: string | null;
  aqsRegressionDelta: number | null;
}

export interface AqsDimensions {
  correctness: number;
  toolUse: number;
  latency: number;
  errorRate: number;
  traceCoverage: number;
}

export interface AqsResult {
  score: number;
  dimensions: AqsDimensions;
  regressionDelta: number | null;
  computedAt: string;
}

export const CATEGORY_LABELS: Record<string, string> = {
  happy_path: "Happy Path",
  edge_case: "Edge Case",
  tool_use: "Tool Use",
  refusal: "Refusal",
  ambiguity: "Ambiguity",
  multi_turn: "Multi-Turn",
  regression: "Regression",
};

export const CATEGORY_COLORS: Record<string, string> = {
  happy_path: "bg-green-500/10 text-green-400 border-green-500/20",
  edge_case: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  tool_use: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  refusal: "bg-red-500/10 text-red-400 border-red-500/20",
  ambiguity: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  multi_turn: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  regression: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};
