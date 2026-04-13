"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/frontend/reusable-components/layout/Navbar";
import { Loader } from "@/frontend/reusable-elements/loaders/Loader";
import { DetailCard } from "@/frontend/reusable-components/cards/DetailCard";
import {
  FloatingAlert,
  type FloatingAlertMessage,
} from "@/frontend/reusable-components/alerts/FloatingAlert";
import {
  BarChart2,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  ExternalLink,
  FlaskConical,
  Play,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { type AgentTestConfig } from "@/types/agent-testing";

interface RunListItem {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  totalCases: number;
  completedCases: number;
  startedAt: string;
  completedAt: string | null;
  aqsScore: number | null;
  aqsCorrectness: number | null;
  aqsToolUse: number | null;
  aqsLatency: number | null;
  aqsErrorRate: number | null;
  aqsTraceCoverage: number | null;
  aqsRegressionDelta: number | null;
}

interface Props {
  configId: string;
}

function AqsBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-xs text-white/30 italic">–</span>;
  }
  const color =
    score >= 80
      ? "text-green-400 bg-green-500/10 border-green-500/20"
      : score >= 60
        ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
        : "text-red-400 bg-red-500/10 border-red-500/20";

  return (
    <span
      className={`text-xs font-bold px-2 py-0.5 rounded-full border ${color}`}
    >
      {score.toFixed(1)}
    </span>
  );
}

function RegressionBadge({ delta }: { delta: number | null }) {
  if (delta === null) return null;
  if (Math.abs(delta) < 0.1) {
    return (
      <span className="flex items-center gap-0.5 text-xs text-white/40">
        <Minus className="w-3 h-3" />
        Same
      </span>
    );
  }
  if (delta > 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs text-green-400">
        <TrendingUp className="w-3 h-3" />+{delta.toFixed(1)}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 text-xs text-red-400">
      <TrendingDown className="w-3 h-3" />
      {delta.toFixed(1)}
    </span>
  );
}

function StatusIcon({ status }: { status: RunListItem["status"] }) {
  if (status === "completed")
    return <CheckCircle2 className="w-4 h-4 text-green-400" />;
  if (status === "failed") return <XCircle className="w-4 h-4 text-red-400" />;
  if (status === "running" || status === "pending")
    return <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />;
  return <Clock className="w-4 h-4 text-white/30" />;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(startedAt: string, completedAt: string | null) {
  if (!completedAt) return null;
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  const secs = Math.round(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return rem > 0 ? `${mins}m ${rem}s` : `${mins}m`;
}

export default function AgentTestHistory({ configId }: Props) {
  const router = useRouter();
  const { status } = useSession();

  const [config, setConfig] = useState<AgentTestConfig | null>(null);
  const [runs, setRuns] = useState<RunListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") loadData();
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
        setRuns(runsData.data ?? []);
      }
    } catch {
      setAlert({
        type: "error",
        title: "Error",
        message: "Failed to load test run history.",
      });
    } finally {
      setLoading(false);
    }
  };

  const navbarActions = [{ type: "signout" as const, showConfirmation: true }];

  if (status === "loading" || loading) {
    return <Loader fullScreen text="Loading history..." />;
  }

  if (!config) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-white/50">Configuration not found.</p>
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
                router.push(`/agent-testing/configs/${configId}/test-cases`)
              }
              className="cursor-pointer hover:text-white/80 transition-colors max-w-[160px] truncate"
            >
              {config.name}
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/90 font-medium">Run History</span>
          </span>
        }
        actions={navbarActions}
      />

      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />

      <div className="px-8 pt-8 pb-8">
        <div className="max-w-5xl mx-auto">
          {/* Page header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <BarChart2 className="w-5 h-5 text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Run History</h1>
              </div>
              <p className="ml-14 text-sm text-white/40">
                All test runs for{" "}
                <span className="text-white/70">{config.name}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() =>
                  router.push(`/agent-testing/configs/${configId}/test-cases`)
                }
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                Test Cases
              </button>
              <button
                onClick={() =>
                  router.push(`/agent-testing/configs/${configId}/test-cases`)
                }
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                New Run
              </button>
            </div>
          </div>

          {/* Empty state */}
          {runs.length === 0 ? (
            <DetailCard contentClassName="">
              <div className="flex flex-col items-center justify-center py-16">
                <BarChart2 className="w-12 h-12 text-white/20 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  No runs yet
                </h3>
                <p className="text-sm text-white/40 mb-6 text-center max-w-sm">
                  This configuration has not been tested yet. Go to Test Cases
                  and click &ldquo;Run Tests&rdquo; to start.
                </p>
                <button
                  onClick={() =>
                    router.push(`/agent-testing/configs/${configId}/test-cases`)
                  }
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Go to Test Cases
                </button>
              </div>
            </DetailCard>
          ) : (
            <div className="space-y-3">
              {runs.map((run, idx) => {
                const isLatest = idx === 0;
                const duration = formatDuration(run.startedAt, run.completedAt);
                return (
                  <DetailCard key={run.id} contentClassName="">
                    <div className="flex items-center gap-4">
                      {/* Status icon */}
                      <div className="shrink-0">
                        <StatusIcon status={run.status} />
                      </div>

                      {/* Run info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-white">
                            {formatDate(run.startedAt)}
                          </span>
                          {isLatest && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              Latest
                            </span>
                          )}
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full border ${
                              run.status === "completed"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : run.status === "failed"
                                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                                  : run.status === "running"
                                    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                    : "bg-white/5 text-white/40 border-white/10"
                            }`}
                          >
                            {run.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-white/40 flex-wrap">
                          <span>
                            {run.completedCases}/{run.totalCases} cases
                          </span>
                          {duration && <span>{duration}</span>}
                        </div>
                      </div>

                      {/* AQS score */}
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          {run.status === "completed" && (
                            <RegressionBadge delta={run.aqsRegressionDelta} />
                          )}
                          <AqsBadge score={run.aqsScore} />
                        </div>
                        {run.status === "completed" &&
                          run.aqsScore !== null && (
                            <div className="flex items-center gap-2 text-xs text-white/30">
                              <span>
                                C:{" "}
                                {run.aqsCorrectness !== null
                                  ? run.aqsCorrectness.toFixed(0)
                                  : "–"}
                              </span>
                              <span>
                                T:{" "}
                                {run.aqsToolUse !== null
                                  ? run.aqsToolUse.toFixed(0)
                                  : "–"}
                              </span>
                              <span>
                                L:{" "}
                                {run.aqsLatency !== null
                                  ? run.aqsLatency.toFixed(0)
                                  : "–"}
                              </span>
                            </div>
                          )}
                      </div>

                      {/* View button */}
                      {(run.status === "completed" ||
                        run.status === "running" ||
                        run.status === "pending") && (
                        <button
                          onClick={() =>
                            router.push(`/agent-testing/runs/${run.id}`)
                          }
                          className="cursor-pointer shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {run.status === "completed" ? "View" : "Watch"}
                        </button>
                      )}
                    </div>
                  </DetailCard>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
