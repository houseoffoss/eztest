"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/frontend/reusable-components/layout/Navbar";
import {
  FloatingAlert,
  type FloatingAlertMessage,
} from "@/frontend/reusable-components/alerts/FloatingAlert";
import { Loader } from "@/frontend/reusable-elements/loaders/Loader";
import { DetailCard } from "@/frontend/reusable-components/cards/DetailCard";
import {
  Bot,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Download,
  Link2,
  ArrowLeft,
  AlertTriangle,
  Activity,
  Zap,
  Target,
  Gauge,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import {
  type AgentTestRunState,
  type AgentTestResultSummary,
  type RubricScore,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from "@/types/agent-testing";

interface Props {
  runId: string;
}

// ─── AQS dimension metadata ────────────────────────────────────────────────

const AQS_DIMENSIONS = [
  {
    key: "aqsCorrectness" as const,
    label: "Correctness",
    icon: Target,
    weight: "40%",
    description: "Rubric pass rate",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  {
    key: "aqsToolUse" as const,
    label: "Tool Use",
    icon: Zap,
    weight: "20%",
    description: "Correct tool-call behaviour",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    key: "aqsLatency" as const,
    label: "Latency",
    icon: Gauge,
    weight: "15%",
    description: "Response speed score",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  {
    key: "aqsErrorRate" as const,
    label: "Reliability",
    icon: Activity,
    weight: "15%",
    description: "Inverted HTTP error rate",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    key: "aqsTraceCoverage" as const,
    label: "Trace Coverage",
    icon: Eye,
    weight: "10%",
    description: "Langfuse trace availability",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
] as const;

// ─── Helpers ───────────────────────────────────────────────────────────────

function aqsColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

function aqsLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}

function aqsBarColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

function parseRubricScores(raw: string | null): RubricScore[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as RubricScore[];
  } catch {
    return [];
  }
}

// ─── Sub-components ────────────────────────────────────────────────────────

function AqsGauge({ score }: { score: number }) {
  const color = aqsColor(score);
  const label = aqsLabel(score);
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            className={color}
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${color}`}>{score}</span>
          <span className="text-xs text-white/40 mt-0.5">/ 100</span>
        </div>
      </div>
      <span className={`text-sm font-semibold ${color}`}>{label}</span>
      <span className="text-xs text-white/40">Agent Quality Score</span>
    </div>
  );
}

function DimensionBar({
  dim,
  value,
}: {
  dim: (typeof AQS_DIMENSIONS)[number];
  value: number | null;
}) {
  const Icon = dim.icon;
  const pct = value ?? 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded ${dim.bg} ${dim.border} border`}>
            <Icon className={`w-3 h-3 ${dim.color}`} />
          </div>
          <span className="text-xs text-white/70 font-medium">{dim.label}</span>
          <span className="text-xs text-white/30">{dim.weight}</span>
        </div>
        <span className={`text-xs font-semibold tabular-nums ${dim.color}`}>
          {pct.toFixed(1)}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
        <div
          className={`h-full rounded-full ${aqsBarColor(pct)} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-white/30">{dim.description}</p>
    </div>
  );
}

function RegressionBadge({ delta }: { delta: number | null }) {
  if (delta === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-white/30">
        <Minus className="w-3 h-3" />
        First run
      </span>
    );
  }
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-400">
        <TrendingUp className="w-3.5 h-3.5" />+{delta.toFixed(1)} vs last run
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-400">
        <TrendingDown className="w-3.5 h-3.5" />
        {delta.toFixed(1)} vs last run
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-white/40">
      <Minus className="w-3 h-3" />
      No change vs last run
    </span>
  );
}

function TraceDrawer({
  result,
  onClose,
}: {
  result: AgentTestResultSummary;
  onClose: () => void;
}) {
  const scores = parseRubricScores(result.rubricScores);

  let traceObs: {
    type?: string;
    name?: string;
    input?: unknown;
    output?: unknown;
    startTime?: string;
    endTime?: string;
  }[] = [];
  if (result.traceJson) {
    try {
      const parsed = JSON.parse(result.traceJson) as {
        observations?: typeof traceObs;
      };
      traceObs = parsed.observations ?? [];
    } catch {
      // ignore
    }
  }

  const toolCalls = traceObs.filter(
    (o) =>
      o.type === "SPAN" &&
      typeof o.name === "string" &&
      o.name.toLowerCase().includes("tool"),
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Drawer panel */}
      <div
        className="relative z-10 w-full max-w-2xl h-full bg-[#0f1117] border-l border-white/10 overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#0f1117] border-b border-white/10 px-6 py-4 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {result.testCase.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CATEGORY_COLORS[result.testCase.category] ?? "bg-white/5 text-white/40 border-white/10"}`}
              >
                {CATEGORY_LABELS[result.testCase.category] ??
                  result.testCase.category}
              </span>
              {result.latencyMs != null && (
                <span className="text-xs text-white/40">
                  {formatMs(result.latencyMs)}
                </span>
              )}
              {result.httpStatus != null && (
                <span
                  className={`text-xs font-mono ${result.httpStatus >= 200 && result.httpStatus < 300 ? "text-green-400" : "text-red-400"}`}
                >
                  HTTP {result.httpStatus}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 px-6 py-5 space-y-6">
          {/* Rubric Scores */}
          <section>
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
              Rubric Evaluation
            </h3>
            {scores.length === 0 ? (
              <p className="text-xs text-white/30 italic">
                {result.scoreError
                  ? `Scoring failed: ${result.scoreError}`
                  : "Not yet scored"}
              </p>
            ) : (
              <div className="space-y-2">
                {scores.map((s, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border px-3 py-2.5 ${s.pass ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}
                  >
                    <div className="flex items-start gap-2">
                      {s.pass ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80 font-medium">
                          {s.criterion}
                        </p>
                        <p className="text-xs text-white/50 mt-0.5">
                          {s.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Input */}
          <section>
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
              Input
            </h3>
            <pre className="text-xs text-white/70 bg-white/5 rounded-lg px-3 py-2.5 font-mono whitespace-pre-wrap">
              {result.testCase.input}
            </pre>
          </section>

          {/* Agent Response */}
          {result.agentResponse && (
            <section>
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                Agent Response
              </h3>
              <pre className="text-xs text-white/70 bg-white/5 rounded-lg px-3 py-2.5 font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                {result.agentResponse}
              </pre>
            </section>
          )}

          {/* Error */}
          {result.errorMessage && (
            <section>
              <h3 className="text-xs font-semibold text-red-400/60 uppercase tracking-wider mb-2">
                Error
              </h3>
              <p className="text-xs text-red-300 bg-red-500/10 rounded-lg px-3 py-2.5">
                {result.errorMessage}
              </p>
            </section>
          )}

          {/* Langfuse Trace */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                Langfuse Trace
              </h3>
              {result.langfuseTraceId && (
                <span className="text-xs text-white/30 font-mono">
                  {result.langfuseTraceId}
                </span>
              )}
            </div>

            {result.traceFetchError ? (
              <div className="flex items-start gap-2 text-xs text-yellow-300 bg-yellow-500/10 rounded-lg px-3 py-2.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {result.traceFetchError}
              </div>
            ) : toolCalls.length > 0 ? (
              <div className="space-y-2">
                {toolCalls.map((t, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2.5"
                  >
                    <p className="text-xs font-semibold text-blue-300 mb-1">
                      {t.name}
                    </p>
                    <div className="space-y-1">
                      <div>
                        <span className="text-xs text-white/30">Input: </span>
                        <span className="text-xs text-white/60 font-mono">
                          {JSON.stringify(t.input ?? {}).slice(0, 300)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-white/30">Output: </span>
                        <span className="text-xs text-white/60 font-mono">
                          {JSON.stringify(t.output ?? {}).slice(0, 300)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : result.langfuseTraceId ? (
              <p className="text-xs text-white/30 italic">
                Trace fetched — no tool calls recorded.
              </p>
            ) : (
              <p className="text-xs text-white/30 italic">
                No trace available for this result.
              </p>
            )}
          </section>

          {/* Expected Behavior */}
          <section>
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
              Expected Behavior
            </h3>
            <p className="text-xs text-white/60">
              {result.testCase.expectedBehavior}
            </p>
          </section>

          {/* Session ID */}
          <section>
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">
              Session ID
            </h3>
            <p className="text-xs text-white/30 font-mono">
              {result.sessionId}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function AgentTestRunResults({ runId }: Props) {
  const router = useRouter();
  const { status } = useSession();

  const [run, setRun] = useState<AgentTestRunState | null>(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);
  const [selectedResult, setSelectedResult] =
    useState<AgentTestResultSummary | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [downloading, setDownloading] = useState<"pdf" | "json" | "csv" | null>(
    null,
  );
  const [copying, setCopying] = useState(false);
  const [recomputingAqs, setRecomputingAqs] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const fetchRun = useCallback(async () => {
    try {
      const res = await fetch(`/api/agent-test-runs/${runId}`);
      if (!res.ok) throw new Error("Failed to load run");
      const data = await res.json();
      setRun(data.data as AgentTestRunState);
    } catch {
      setAlert({
        type: "error",
        title: "Error",
        message: "Failed to load test run.",
      });
    } finally {
      setLoading(false);
    }
  }, [runId]);

  // Initial load + polling while running
  useEffect(() => {
    if (status !== "authenticated") return;
    fetchRun();
  }, [status, fetchRun]);

  useEffect(() => {
    if (!run) return;
    if (run.status !== "running" && run.status !== "pending") return;
    const t = setTimeout(fetchRun, 2500);
    return () => clearTimeout(t);
  }, [run, fetchRun]);

  // ── Filtered results ────────────────────────────────────────────────────

  const allResults = run?.results ?? [];
  const filteredResults = allResults.filter((r) => {
    if (categoryFilter !== "all" && r.testCase.category !== categoryFilter)
      return false;
    if (statusFilter === "pass") {
      const scores = parseRubricScores(r.rubricScores);
      if (scores.length === 0) return false;
      return scores.every((s) => s.pass);
    }
    if (statusFilter === "fail") {
      const scores = parseRubricScores(r.rubricScores);
      return scores.some((s) => !s.pass);
    }
    if (statusFilter === "error") return r.status === "error";
    return true;
  });

  // ── Stats ───────────────────────────────────────────────────────────────

  const scoredResults = allResults.filter(
    (r) => r.passCount != null && r.failCount != null,
  );
  const unscoredResults = allResults.filter(
    (r) => r.passCount == null && r.failCount == null,
  );
  const scoringErrorResults = allResults.filter((r) => r.scoreError != null);

  const totalPass = scoredResults.reduce((s, r) => s + (r.passCount ?? 0), 0);
  const totalFail = scoredResults.reduce((s, r) => s + (r.failCount ?? 0), 0);
  const totalCriteria = totalPass + totalFail;
  // Pass rate is calculated only over scored results — unscored results are
  // explicitly excluded and surfaced as a warning so the number isn't misleading.
  const overallPassRate =
    totalCriteria > 0 ? Math.round((totalPass / totalCriteria) * 100) : null;

  const categories = Array.from(
    new Set(allResults.map((r) => r.testCase.category)),
  );

  // ── Download handlers ───────────────────────────────────────────────────

  const handleDownloadJSON = () => {
    if (!run) return;
    setDownloading("json");
    try {
      const blob = new Blob([JSON.stringify(run, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `agent-test-run-${runId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadCSV = () => {
    if (!run) return;
    setDownloading("csv");
    try {
      const header = [
        "Title",
        "Category",
        "Status",
        "HTTP Status",
        "Latency (ms)",
        "Pass Count",
        "Fail Count",
        "Session ID",
        "Executed At",
        "Trace ID",
      ];
      const rows = run.results.map((r) => [
        `"${r.testCase.title.replace(/"/g, '""')}"`,
        r.testCase.category,
        r.status,
        r.httpStatus ?? "",
        r.latencyMs ?? "",
        r.passCount ?? "",
        r.failCount ?? "",
        r.sessionId,
        r.executedAt,
        r.langfuseTraceId ?? "",
      ]);
      const csv = [header.join(","), ...rows.map((r) => r.join(","))].join(
        "\n",
      );
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `agent-test-run-${runId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadPDF = async () => {
    if (!run) return;
    setDownloading("pdf");
    try {
      const res = await fetch(
        `/api/agent-test-runs/${runId}/report?format=pdf`,
      );
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `agent-test-run-${runId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setAlert({
        type: "error",
        title: "PDF Error",
        message: "PDF download failed. Try JSON or CSV instead.",
      });
    } finally {
      setDownloading(null);
    }
  };

  const handleCopyShareLink = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(window.location.href);
      setAlert({
        type: "success",
        title: "Copied",
        message: "Share link copied to clipboard.",
      });
    } catch {
      setAlert({
        type: "error",
        title: "Error",
        message: "Could not copy link.",
      });
    } finally {
      setTimeout(() => setCopying(false), 1500);
    }
  };

  const handleRecomputeAqs = async () => {
    setRecomputingAqs(true);
    try {
      const res = await fetch(`/api/agent-test-runs/${runId}/aqs`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("AQS recompute failed");
      await fetchRun();
      setAlert({
        type: "success",
        title: "AQS Updated",
        message: "Agent Quality Score recomputed.",
      });
    } catch {
      setAlert({
        type: "error",
        title: "Error",
        message: "Failed to recompute AQS.",
      });
    } finally {
      setRecomputingAqs(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  if (status === "loading" || loading) {
    return <Loader fullScreen text="Loading results..." />;
  }

  if (!run) {
    return (
      <div className="flex-1">
        <Navbar
          brandLabel={null}
          items={[]}
          breadcrumbs={
            <span className="flex items-center gap-1 text-sm text-white/50">
              <span>Agent Testing</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white/90 font-medium">Results</span>
            </span>
          }
          actions={[{ type: "signout" as const, showConfirmation: true }]}
        />
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <AlertTriangle className="w-10 h-10 text-yellow-400" />
          <p className="text-white/60">Test run not found.</p>
          <button
            onClick={() => router.push("/agent-testing/setup")}
            className="cursor-pointer text-sm text-blue-400 hover:underline"
          >
            Back to Setup
          </button>
        </div>
      </div>
    );
  }

  const isRunning = run.status === "running" || run.status === "pending";
  const hasAqs = run.aqsScore != null;

  return (
    <div className="flex-1">
      <Navbar
        brandLabel={null}
        items={[]}
        breadcrumbs={
          <span className="flex items-center gap-1 text-sm text-white/50">
            <button
              onClick={() => router.push("/agent-testing/setup")}
              className="cursor-pointer hover:text-white/80 transition-colors"
            >
              Agent Testing
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/90 font-medium">
              {run.configName ?? "Run Results"}
            </span>
          </span>
        }
        actions={[
          {
            type: "action" as const,
            label: copying ? "Copied!" : "Share",
            onClick: handleCopyShareLink,
            variant: "secondary" as const,
            buttonName: "Share run link",
          },
          { type: "signout" as const, showConfirmation: true },
        ]}
      />

      <div className="px-6 pt-8 pb-12">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* ── Page header ── */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <button
                  onClick={() => router.push("/agent-testing/setup")}
                  className="cursor-pointer p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Bot className="w-5 h-5 text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">
                  {run.configName ?? "Test Run Results"}
                </h1>
                {isRunning && (
                  <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Running…
                  </span>
                )}
                {run.status === "completed" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                    Completed
                  </span>
                )}
              </div>
              <p className="text-sm text-white/40 ml-[3.25rem]">
                {run.completedCases} / {run.totalCases} tests completed
                {run.completedAt && (
                  <> · {new Date(run.completedAt).toLocaleString()}</>
                )}
              </p>
              {run.agentApiUrl && (
                <p className="flex items-center gap-1.5 text-xs text-white/30 ml-[3.25rem] mt-0.5 font-mono">
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  {run.agentApiUrl}
                </p>
              )}
            </div>

            {/* Download buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyShareLink}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/60 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <Link2 className="w-3.5 h-3.5" />
                {copying ? "Copied!" : "Share"}
              </button>
              <button
                onClick={handleDownloadCSV}
                disabled={downloading === "csv"}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/60 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                CSV
              </button>
              <button
                onClick={handleDownloadJSON}
                disabled={downloading === "json"}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/60 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                JSON
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={downloading === "pdf"}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors disabled:opacity-50"
              >
                {downloading === "pdf" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                PDF
              </button>
            </div>
          </div>

          {/* ── Progress bar (while running) ── */}
          {isRunning && (
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-yellow-500 transition-all duration-500"
                style={{
                  width: run.totalCases
                    ? `${(run.completedCases / run.totalCases) * 100}%`
                    : "0%",
                }}
              />
            </div>
          )}

          {/* ── AQS + Quick stats row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* AQS Gauge card */}
            <DetailCard contentClassName="flex flex-col items-center gap-4">
              {hasAqs ? (
                <>
                  <AqsGauge score={run.aqsScore!} />
                  <RegressionBadge delta={run.aqsRegressionDelta ?? null} />
                  <button
                    onClick={handleRecomputeAqs}
                    disabled={recomputingAqs || isRunning}
                    className="cursor-pointer flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors disabled:opacity-50"
                  >
                    <RotateCcw
                      className={`w-3 h-3 ${recomputingAqs ? "animate-spin" : ""}`}
                    />
                    Recompute AQS
                  </button>
                </>
              ) : isRunning ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
                  <p className="text-sm text-white/40">
                    AQS computed after run completes
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-4">
                  <p className="text-sm text-white/40">AQS not yet computed</p>
                  <button
                    onClick={handleRecomputeAqs}
                    disabled={recomputingAqs}
                    className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                  >
                    {recomputingAqs ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Activity className="w-3 h-3" />
                    )}
                    Compute AQS
                  </button>
                </div>
              )}
            </DetailCard>

            {/* Dimension breakdown */}
            <DetailCard
              title="Score Breakdown"
              contentClassName="space-y-4"
              className="lg:col-span-2"
            >
              {AQS_DIMENSIONS.map((dim) => (
                <DimensionBar
                  key={dim.key}
                  dim={dim}
                  value={run[dim.key] as number | null}
                />
              ))}
            </DetailCard>
          </div>

          {/* ── Scoring error warning banner ── */}
          {scoringErrorResults.length > 0 && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-yellow-500/8 border border-yellow-500/20">
              <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-300/80">
                <span className="font-medium text-yellow-300">
                  {scoringErrorResults.length} result
                  {scoringErrorResults.length > 1 ? "s" : ""} could not be
                  scored
                </span>{" "}
                — rubric evaluation failed (e.g. AI quota exceeded). The pass
                rate below only counts the{" "}
                <span className="font-medium">{scoredResults.length}</span>{" "}
                result
                {scoredResults.length !== 1 ? "s" : ""} that were scored
                successfully. Re-score individual results using the re-score
                button inside each result row.
              </div>
            </div>
          )}

          {/* ── Summary stats row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <DetailCard contentClassName="text-center">
              <p className="text-2xl font-bold text-white">
                {allResults.length}
              </p>
              <p className="text-xs text-white/40 mt-0.5">Total Tests</p>
            </DetailCard>
            <DetailCard contentClassName="text-center">
              {overallPassRate !== null ? (
                <p
                  className={`text-2xl font-bold ${overallPassRate >= 70 ? "text-green-400" : overallPassRate >= 40 ? "text-yellow-400" : "text-red-400"}`}
                >
                  {overallPassRate}%
                </p>
              ) : (
                <p className="text-2xl font-bold text-white/20">–</p>
              )}
              <p className="text-xs text-white/40 mt-0.5">
                Criteria Pass Rate
                {unscoredResults.length > 0 && overallPassRate !== null && (
                  <span className="block text-yellow-400/60">
                    ({scoredResults.length}/{allResults.length} scored)
                  </span>
                )}
              </p>
            </DetailCard>
            <DetailCard contentClassName="text-center">
              <p className="text-2xl font-bold text-green-400">{totalPass}</p>
              <p className="text-xs text-white/40 mt-0.5">Criteria Passed</p>
            </DetailCard>
            <DetailCard contentClassName="text-center">
              <p className="text-2xl font-bold text-red-400">{totalFail}</p>
              <p className="text-xs text-white/40 mt-0.5">Criteria Failed</p>
            </DetailCard>
          </div>

          {/* ── Results table ── */}
          <DetailCard
            title="Test Results"
            contentClassName="space-y-3"
            headerAction={
              <div className="flex items-center gap-2">
                {/* Category filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="cursor-pointer text-xs bg-white/5 text-white/60 border border-white/10 rounded-lg px-2 py-1.5 focus:outline-none focus:border-white/30"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c] ?? c}
                    </option>
                  ))}
                </select>

                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="cursor-pointer text-xs bg-white/5 text-white/60 border border-white/10 rounded-lg px-2 py-1.5 focus:outline-none focus:border-white/30"
                >
                  <option value="all">All Results</option>
                  <option value="pass">Passed</option>
                  <option value="fail">Failed</option>
                  <option value="error">Errors</option>
                </select>
              </div>
            }
          >
            {filteredResults.length === 0 ? (
              <div className="py-8 text-center text-white/30 text-sm">
                No results match the current filters.
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredResults.map((result) => {
                  const scores = parseRubricScores(result.rubricScores);
                  const allPass =
                    scores.length > 0 && scores.every((s) => s.pass);
                  const anyFail = scores.some((s) => !s.pass);

                  return (
                    <button
                      key={result.id}
                      onClick={() => setSelectedResult(result)}
                      className="cursor-pointer w-full rounded-lg border border-white/8 bg-white/3 hover:bg-white/6 transition-colors overflow-hidden"
                    >
                      <div className="flex items-center gap-3 px-3 py-3 text-left">
                        {/* Pass/fail icon */}
                        <span className="shrink-0">
                          {result.status === "pending" && (
                            <Clock className="w-4 h-4 text-white/30" />
                          )}
                          {result.status === "success" && allPass && (
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          )}
                          {result.status === "success" && anyFail && (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                          {result.status === "success" &&
                            scores.length === 0 &&
                            !result.scoreError && (
                              <CheckCircle2 className="w-4 h-4 text-white/30" />
                            )}
                          {result.status === "success" &&
                            scores.length === 0 &&
                            result.scoreError && (
                              <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            )}
                          {result.status === "error" && (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                        </span>

                        {/* Title */}
                        <span className="flex-1 text-sm text-white/80 text-left truncate">
                          {result.testCase.title}
                        </span>

                        {/* Category badge */}
                        <span
                          className={`shrink-0 text-xs px-1.5 py-0.5 rounded border font-medium ${CATEGORY_COLORS[result.testCase.category] ?? "bg-white/5 text-white/40 border-white/10"}`}
                        >
                          {CATEGORY_LABELS[result.testCase.category] ??
                            result.testCase.category}
                        </span>

                        {/* Rubric score */}
                        {scores.length > 0 && (
                          <span
                            className={`shrink-0 text-xs font-semibold tabular-nums ${allPass ? "text-green-400" : "text-red-400"}`}
                          >
                            {result.passCount}/
                            {(result.passCount ?? 0) + (result.failCount ?? 0)}
                          </span>
                        )}
                        {scores.length === 0 && result.scoreError && (
                          <span className="shrink-0 text-xs text-yellow-400/70 italic">
                            scoring failed
                          </span>
                        )}

                        {/* Latency */}
                        {result.latencyMs != null && (
                          <span className="shrink-0 text-xs text-white/30 tabular-nums">
                            {formatMs(result.latencyMs)}
                          </span>
                        )}

                        {/* HTTP status */}
                        {result.httpStatus != null && (
                          <span
                            className={`shrink-0 text-xs font-mono ${result.httpStatus >= 200 && result.httpStatus < 300 ? "text-green-400" : "text-red-400"}`}
                          >
                            {result.httpStatus}
                          </span>
                        )}

                        {/* Trace indicator */}
                        {result.langfuseTraceId && (
                          <ExternalLink className="w-3.5 h-3.5 text-purple-400/60 shrink-0" />
                        )}

                        <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                      </div>

                      {/* Inline mini rubric preview for failures */}
                      {anyFail && scores.length > 0 && (
                        <div className="px-10 pb-2.5 space-y-1">
                          {scores
                            .filter((s) => !s.pass)
                            .slice(0, 2)
                            .map((s, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-1.5 text-xs text-red-300/70"
                              >
                                <XCircle className="w-3 h-3 text-red-400/50 shrink-0 mt-0.5" />
                                <span className="truncate">{s.criterion}</span>
                              </div>
                            ))}
                          {scores.filter((s) => !s.pass).length > 2 && (
                            <p className="text-xs text-white/20 pl-4">
                              +{scores.filter((s) => !s.pass).length - 2} more
                              failures
                            </p>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </DetailCard>
        </div>
      </div>

      {/* ── Trace drawer ── */}
      {selectedResult && (
        <TraceDrawer
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}

      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />
    </div>
  );
}
