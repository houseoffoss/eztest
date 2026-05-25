"use client";

import { useState, useEffect } from "react";
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
  ChevronRight,
  History,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Zap,
  Gauge,
  Activity,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { type AgentTestRunState } from "@/types/agent-testing";

interface Props {
  configId: string;
}

interface RunSummary {
  id?: string;
  runId?: string;
  status: "pending" | "running" | "completed" | "failed";
  totalCases: number;
  completedCases: number;
  startedAt: string;
  completedAt: string | null;
  aqsScore?: number | null;
  aqsRegressionDelta?: number | null;
  configName?: string;
  agentApiUrl?: string;
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
        <TrendingUp className="w-3.5 h-3.5" />+{delta.toFixed(1)} vs last
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-400">
        <TrendingDown className="w-3.5 h-3.5" />
        {delta.toFixed(1)} vs last
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-white/40">
      <Minus className="w-3 h-3" />
      No change
    </span>
  );
}

function AQSBadge({ score }: { score: number }) {
  let color = "text-red-400";
  if (score >= 80) color = "text-green-400";
  else if (score >= 60) color = "text-yellow-400";
  else if (score >= 40) color = "text-orange-400";

  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${color}`}>
      <Target className="w-4 h-4" />
      {score}
    </span>
  );
}

export default function AgentTestResultsHistory({ configId }: Props) {
  const router = useRouter();
  const { status } = useSession();

  const [config, setConfig] = useState<{ name: string } | null>(null);
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      loadData();
    }
  }, [status, configId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [configRes, runsRes] = await Promise.all([
        fetch(`/api/agent-test-configs/${configId}`),
        fetch(`/api/agent-test-configs/${configId}/run-tests`),
      ]);

      if (!configRes.ok) throw new Error("Config not found");
      const configData = await configRes.json();
      setConfig(configData.data);

      if (runsRes.ok) {
        const runsData = await runsRes.json();
        setRuns((runsData.data ?? []) as RunSummary[]);
      }
    } catch (err) {
      setAlert({
        type: "error",
        title: "Error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to load test results.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRuns =
    filterStatus === "all"
      ? runs
      : runs.filter((r) => r.status === filterStatus);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case "running":
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Clock className="w-3 h-3 animate-pulse" />
            Running
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  if (status === "loading" || loading) {
    return <Loader fullScreen text="Loading test results..." />;
  }

  if (!config) {
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
          <p className="text-white/60">Configuration not found.</p>
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
            <button
              onClick={() =>
                router.push(
                  `/agent-testing/configs/${configId}/test-cases`
                )
              }
              className="cursor-pointer hover:text-white/80 transition-colors max-w-[160px] truncate"
            >
              {config.name}
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/90 font-medium">Results History</span>
          </span>
        }
        actions={[{ type: "signout" as const, showConfirmation: true }]}
      />

      <div className="px-6 pt-8 pb-12">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <button
                  onClick={() =>
                    router.push(
                      `/agent-testing/configs/${configId}/test-cases`
                    )
                  }
                  className="cursor-pointer p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <History className="w-5 h-5 text-purple-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Results History</h1>
              </div>
              <p className="text-sm text-white/40 ml-[3.25rem]">
                {runs.length} test run{runs.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Filter tabs */}
          {runs.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                key="all"
                onClick={() => setFilterStatus("all")}
                className={`cursor-pointer text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  filterStatus === "all"
                    ? "bg-white/10 text-white border-white/20"
                    : "bg-white/3 text-white/50 border-white/10 hover:bg-white/8"
                }`}
              >
                All ({runs.length})
              </button>
              {["completed", "running", "pending", "failed"].map((status) => {
                const count = runs.filter((r) =>
                  status === "running" || status === "pending"
                    ? r.status === status || r.status === "running"
                    : r.status === status
                ).length;
                if (count === 0) return null;
                return (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`cursor-pointer text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      filterStatus === status
                        ? status === "completed"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : status === "failed"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        : "bg-white/3 text-white/50 border-white/10 hover:bg-white/8"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Results list */}
          <DetailCard contentClassName="">
            {filteredRuns.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-4 text-center">
                <div className="p-3 rounded-full bg-white/5">
                  <History className="w-8 h-8 text-white/30" />
                </div>
                <div>
                  <p className="font-medium text-white/70">
                    {runs.length === 0
                      ? "No test runs yet"
                      : "No results match filter"}
                  </p>
                  <p className="text-sm text-white/40 mt-1">
                    {runs.length === 0
                      ? "Run tests from the test cases page to see results here."
                      : "Try adjusting your filters."}
                  </p>
                </div>
                {runs.length === 0 && (
                  <button
                    onClick={() =>
                      router.push(
                        `/agent-testing/configs/${configId}/test-cases`
                      )
                    }
                    className="cursor-pointer mt-2 px-4 py-2 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                  >
                    Go to Test Cases
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredRuns.map((run) => {
                  const runId = run.runId || run.id;
                  return (
                    <button
                      key={runId}
                      onClick={() => router.push(`/agent-testing/runs/${runId}`)}
                      className="cursor-pointer w-full rounded-lg border border-white/8 bg-white/3 hover:bg-white/6 transition-colors overflow-hidden"
                    >
                    <div className="flex items-center gap-3 px-4 py-3 text-left">
                      {/* Status icon */}
                      <span className="shrink-0">
                        {run.status === "pending" || run.status === "running" ? (
                          <Clock className="w-4 h-4 text-yellow-400" />
                        ) : run.status === "completed" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                      </span>

                      {/* Date and time */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-white/80">
                            {new Date(run.startedAt).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-white/60">
                            {new Date(run.startedAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/40">
                            {run.completedCases}/{run.totalCases} completed
                          </span>
                          {run.completedAt && (
                            <span className="text-xs text-white/30">
                              • {new Date(run.completedAt).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status badge */}
                      {getStatusBadge(run.status)}

                      {/* AQS Score (if available) */}
                      {run.aqsScore != null && (
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <AQSBadge score={run.aqsScore} />
                          {run.aqsRegressionDelta != null && (
                            <RegressionBadge delta={run.aqsRegressionDelta} />
                          )}
                        </div>
                      )}

                      <ExternalLink className="w-3.5 h-3.5 text-white/20 shrink-0" />
                    </div>
                  </button>
                  );
                })}
              </div>
            )}
          </DetailCard>
        </div>
      </div>

      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />
    </div>
  );
}
