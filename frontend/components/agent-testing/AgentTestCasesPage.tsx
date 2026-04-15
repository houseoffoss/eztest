"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/frontend/reusable-components/layout/Navbar";
import {
  FloatingAlert,
  type FloatingAlertMessage,
} from "@/frontend/reusable-components/alerts/FloatingAlert";
import { Loader } from "@/frontend/reusable-elements/loaders/Loader";
import { DetailCard } from "@/frontend/reusable-components/cards/DetailCard";
import { Input } from "@/frontend/reusable-elements/inputs/Input";
import { Textarea } from "@/frontend/reusable-elements/textareas/Textarea";
import { Label } from "@/frontend/reusable-elements/labels/Label";
import { ButtonPrimary } from "@/frontend/reusable-elements/buttons/ButtonPrimary";
import {
  Bot,
  ChevronRight,
  Sparkles,
  Plus,
  Trash2,
  Pencil,
  Play,
  Pause,
  Square,
  Loader2,
  X,
  Check,
  FlaskConical,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  type AgentTestCase,
  type AgentTestConfig,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from "@/types/agent-testing";

const CATEGORIES = [
  "happy_path",
  "edge_case",
  "tool_use",
  "refusal",
  "ambiguity",
  "multi_turn",
  "regression",
] as const;

type Category = (typeof CATEGORIES)[number];

interface AgentTestRunSummary {
  runId: string;
  status: "pending" | "running" | "paused" | "stopped" | "completed" | "failed";
  totalCases: number;
  completedCases: number;
  startedAt: string;
  completedAt: string | null;
  results: {
    id: string;
    testCaseId: string;
    status: "pending" | "success" | "error";
    latencyMs: number | null;
    httpStatus: number | null;
    errorMessage: string | null;
    testCase: { title: string; category: string };
  }[];
}

interface TestCaseFormData {
  category: Category;
  title: string;
  input: string;
  rubric: string;
  expectedBehavior: string;
}

const emptyForm: TestCaseFormData = {
  category: "happy_path",
  title: "",
  input: "",
  rubric: "",
  expectedBehavior: "",
};

interface Props {
  configId: string;
}

export default function AgentTestCasesPage({ configId }: Props) {
  const router = useRouter();
  const { status } = useSession();

  const [config, setConfig] = useState<AgentTestConfig | null>(null);
  const [testCases, setTestCases] = useState<AgentTestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  // Add manual test case
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<TestCaseFormData>(emptyForm);
  const [addErrors, setAddErrors] = useState<Partial<TestCaseFormData>>({});
  const [addSubmitting, setAddSubmitting] = useState(false);

  // Edit test case
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TestCaseFormData>(emptyForm);
  const [editErrors, setEditErrors] = useState<Partial<TestCaseFormData>>({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Expand test case details
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Regenerate
  const [generating, setGenerating] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [maxTestCases, setMaxTestCases] = useState<string>("");

  // Run
  const [running, setRunning] = useState(false);
  const [controllingRun, setControllingRun] = useState(false);
  const [activeRun, setActiveRun] = useState<AgentTestRunSummary | null>(null);
  // When true the polling loop exits immediately on the next tick
  const stopPollingRef = useRef(false);

  // Filter by category
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      loadAll();
    }
    return () => {
      // Stop any in-flight poll when the component unmounts or configId changes
      stopPollingRef.current = true;
    };
  }, [status, configId]);

  const poll = (runId: string) => {
    stopPollingRef.current = false;
    const doPoll = async () => {
      if (stopPollingRef.current) return;
      try {
        const pollRes = await fetch(`/api/agent-test-runs/${runId}`);
        if (pollRes.ok) {
          const pollData = await pollRes.json();
          const updated: AgentTestRunSummary = pollData.data;
          // Re-check after the async fetch — stop may have been triggered while
          // this request was in-flight. Never let a stale poll overwrite a
          // terminal state the user already triggered locally.
          if (stopPollingRef.current) return;
          setActiveRun((prev) => {
            // If the local state is already terminal (stopped/completed/failed),
            // don't overwrite it with a stale "running" response from the server.
            const terminalLocally =
              prev?.status === "stopped" ||
              prev?.status === "completed" ||
              prev?.status === "failed";
            return terminalLocally ? prev : updated;
          });
          if (
            updated.status === "running" ||
            updated.status === "pending" ||
            updated.status === "paused"
          ) {
            setTimeout(doPoll, 2000);
          } else {
            setRunning(false);
          }
          return;
        }
        // Run no longer exists (e.g. config was deleted) — stop polling
        if (pollRes.status === 404) {
          setRunning(false);
          setActiveRun(null);
          return;
        }
      } catch {
        // network hiccup — retry
      }
      if (!stopPollingRef.current) setTimeout(doPoll, 3000);
    };
    setTimeout(doPoll, 2000);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [configRes, casesRes, runsRes] = await Promise.all([
        fetch(`/api/agent-test-configs/${configId}`),
        fetch(`/api/agent-test-configs/${configId}/generate-tests`),
        fetch(`/api/agent-test-configs/${configId}/run-tests`),
      ]);
      if (!configRes.ok) throw new Error("Config not found");
      const configData = await configRes.json();
      setConfig(configData.data);
      if (casesRes.ok) {
        const casesData = await casesRes.json();
        setTestCases(casesData.data ?? []);
      }
      // Restore the latest run state so a page refresh doesn't lose partial results
      if (runsRes.ok) {
        const runsData = await runsRes.json();
        const runs: { id: string; status: string }[] = runsData.data ?? [];
        const latest = runs[0];
        if (latest) {
          const runRes = await fetch(`/api/agent-test-runs/${latest.id}`);
          if (runRes.ok) {
            const runData = await runRes.json();
            const run: AgentTestRunSummary = runData.data;
            setActiveRun(run);
            if (
              run.status === "running" ||
              run.status === "pending" ||
              run.status === "paused"
            ) {
              setRunning(true);
              poll(run.runId);
            }
          }
        }
      }
    } catch {
      setAlert({
        type: "error",
        title: "Error",
        message: "Failed to load configuration.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── Validate ──────────────────────────────────────────────────────────────

  const validateForm = (form: TestCaseFormData): Partial<TestCaseFormData> => {
    const errors: Partial<TestCaseFormData> = {};
    if (!form.title.trim()) errors.title = "Title is required";
    if (!form.input.trim()) errors.input = "Input is required";
    if (!form.rubric.trim()) errors.rubric = "Rubric is required";
    if (!form.expectedBehavior.trim())
      errors.expectedBehavior = "Expected behavior is required";
    return errors;
  };

  // ─── Add manual test case ─────────────────────────────────────────────────

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(addForm);
    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }
    setAddSubmitting(true);
    try {
      const res = await fetch(
        `/api/agent-test-configs/${configId}/test-cases`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addForm),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to create test case");
      setTestCases((prev) => [...prev, data.data]);
      setAddForm(emptyForm);
      setAddErrors({});
      setShowAddForm(false);
      setAlert({
        type: "success",
        title: "Created",
        message: `Test case "${data.data.title}" created.`,
      });
    } catch (err) {
      setAlert({
        type: "error",
        title: "Error",
        message:
          err instanceof Error ? err.message : "Failed to create test case.",
      });
    } finally {
      setAddSubmitting(false);
    }
  };

  // ─── Edit test case ───────────────────────────────────────────────────────

  const handleStartEdit = (tc: AgentTestCase) => {
    setEditingId(tc.id);
    setEditForm({
      category: tc.category as Category,
      title: tc.title,
      input: tc.input,
      rubric: tc.rubric,
      expectedBehavior: tc.expectedBehavior,
    });
    setEditErrors({});
    setExpandedId(null);
  };

  const handleEditSubmit = async (e: React.FormEvent, tcId: string) => {
    e.preventDefault();
    const errors = validateForm(editForm);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/agent-test-cases/${tcId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to update test case");
      setTestCases((prev) =>
        prev.map((tc) => (tc.id === tcId ? data.data : tc)),
      );
      setEditingId(null);
      setAlert({
        type: "success",
        title: "Updated",
        message: `Test case "${data.data.title}" updated.`,
      });
    } catch (err) {
      setAlert({
        type: "error",
        title: "Error",
        message:
          err instanceof Error ? err.message : "Failed to update test case.",
      });
    } finally {
      setEditSubmitting(false);
    }
  };

  // ─── Delete test case ─────────────────────────────────────────────────────

  const handleDelete = async (tc: AgentTestCase) => {
    if (!confirm(`Delete test case "${tc.title}"? This cannot be undone.`))
      return;
    try {
      const res = await fetch(`/api/agent-test-cases/${tc.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setTestCases((prev) => prev.filter((c) => c.id !== tc.id));
      if (expandedId === tc.id) setExpandedId(null);
      if (editingId === tc.id) setEditingId(null);
      setAlert({
        type: "success",
        title: "Deleted",
        message: `Test case "${tc.title}" deleted.`,
      });
    } catch {
      setAlert({
        type: "error",
        title: "Error",
        message: "Failed to delete test case.",
      });
    }
  };

  // ─── Regenerate ───────────────────────────────────────────────────────────

  const handleRegenerate = async () => {
    setShowRegenConfirm(false);
    setGenerating(true);
    try {
      const parsed = parseInt(maxTestCases, 10);
      const limitParam =
        maxTestCases.trim() !== "" && !isNaN(parsed) && parsed > 0
          ? `?maxTestCases=${parsed}`
          : "";
      const res = await fetch(
        `/api/agent-test-configs/${configId}/generate-tests${limitParam}`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to generate test cases");
      setTestCases(data.data);
      setAlert({
        type: "success",
        title: "Generated",
        message: `${data.data.length} test cases generated.`,
      });
    } catch (err) {
      setAlert({
        type: "error",
        title: "Generation Failed",
        message:
          err instanceof Error ? err.message : "Failed to generate test cases.",
      });
    } finally {
      setGenerating(false);
    }
  };

  // ─── Run tests ────────────────────────────────────────────────────────────

  const handleRunTests = async () => {
    stopPollingRef.current = false;
    setRunning(true);
    try {
      const res = await fetch(`/api/agent-test-configs/${configId}/run-tests`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to start test run");

      const run: AgentTestRunSummary = data.data;
      setActiveRun(run);

      if (run.status === "running" || run.status === "pending") {
        poll(run.runId);
      } else {
        setRunning(false);
      }
    } catch (err) {
      setRunning(false);
      setAlert({
        type: "error",
        title: "Run Failed",
        message:
          err instanceof Error ? err.message : "Failed to start test run.",
      });
    }
  };

  // ─── Stop / Pause / Resume ────────────────────────────────────────────────

  const handleStopRun = async () => {
    if (!activeRun) return;
    // Kill the polling loop immediately so it can't overwrite the stopped state
    stopPollingRef.current = true;
    setControllingRun(true);
    try {
      const res = await fetch(`/api/agent-test-runs/${activeRun.runId}/stop`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to stop run");
      }
      setActiveRun((prev) => (prev ? { ...prev, status: "stopped" } : prev));
      setRunning(false);
    } catch (err) {
      // Restore polling if the stop request failed
      stopPollingRef.current = false;
      setAlert({
        type: "error",
        title: "Error",
        message: err instanceof Error ? err.message : "Failed to stop run.",
      });
    } finally {
      setControllingRun(false);
    }
  };

  const handlePauseRun = async () => {
    if (!activeRun) return;
    setControllingRun(true);
    try {
      const res = await fetch(`/api/agent-test-runs/${activeRun.runId}/pause`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to pause run");
      }
      setActiveRun((prev) => (prev ? { ...prev, status: "paused" } : prev));
    } catch (err) {
      setAlert({
        type: "error",
        title: "Error",
        message: err instanceof Error ? err.message : "Failed to pause run.",
      });
    } finally {
      setControllingRun(false);
    }
  };

  const handleResumeRun = async () => {
    if (!activeRun) return;
    setControllingRun(true);
    try {
      const res = await fetch(
        `/api/agent-test-runs/${activeRun.runId}/resume`,
        { method: "POST" },
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to resume run");
      }
      setActiveRun((prev) => (prev ? { ...prev, status: "running" } : prev));
    } catch (err) {
      setAlert({
        type: "error",
        title: "Error",
        message: err instanceof Error ? err.message : "Failed to resume run.",
      });
    } finally {
      setControllingRun(false);
    }
  };

  // ─── Derived ──────────────────────────────────────────────────────────────

  const filtered =
    filterCategory === "all"
      ? testCases
      : testCases.filter((tc) => tc.category === filterCategory);

  const categoryCounts = testCases.reduce(
    (acc, tc) => {
      acc[tc.category] = (acc[tc.category] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const inProgressResult =
    activeRun?.status === "running"
      ? (activeRun.results.find((r) => r.status === "pending") ?? null)
      : null;

  const navbarActions = [{ type: "signout" as const, showConfirmation: true }];

  if (status === "loading" || loading) {
    return <Loader fullScreen text="Loading test cases..." />;
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
              onClick={() => router.push("/agent-testing/setup")}
              className="cursor-pointer hover:text-white/80 transition-colors max-w-[160px] truncate"
            >
              {config.name}
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/90 font-medium">Test Cases</span>
          </span>
        }
        actions={navbarActions}
      />

      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />

      {/* Regenerate confirm modal */}
      {showRegenConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#0f0f12] border border-white/15 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-yellow-500/10 shrink-0">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="font-medium text-white">
                  Re-generate Test Cases?
                </p>
                <p className="text-sm text-white/50 mt-1">
                  This will permanently delete all {testCases.length} existing
                  test cases and replace them with newly generated ones.
                </p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                Max test cases (optional)
              </label>
              <input
                type="number"
                min={1}
                max={20}
                placeholder="Unlimited (max 20)"
                value={maxTestCases}
                onChange={(e) => setMaxTestCases(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/25"
              />
            </div>
            <div className="flex justify-end gap-3">
              <ButtonPrimary
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowRegenConfirm(false);
                  setMaxTestCases("");
                }}
              >
                Cancel
              </ButtonPrimary>
              <button
                onClick={handleRegenerate}
                className="cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Yes, Re-generate
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-8 pt-8 pb-8">
        <div className="max-w-5xl mx-auto">
          {/* Page header */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <FlaskConical className="w-5 h-5 text-blue-400" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">
                    {config.name}
                  </h1>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      config.aiProvider === "google"
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                    }`}
                  >
                    {config.aiModel ??
                      (config.aiProvider === "google" ? "Gemini" : "Claude")}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-14">
                  <a
                    href={config.agentApiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline cursor-pointer"
                  >
                    {config.agentApiUrl}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {testCases.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {testCases.length} test cases
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Regenerate */}
                <button
                  onClick={() =>
                    testCases.length > 0
                      ? setShowRegenConfirm(true)
                      : handleRegenerate()
                  }
                  disabled={generating}
                  className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      {testCases.length > 0 ? "Re-generate" : "Generate Tests"}
                    </>
                  )}
                </button>

                {/* Add manual */}
                <button
                  onClick={() => {
                    setShowAddForm(true);
                    setAddForm(emptyForm);
                    setAddErrors({});
                  }}
                  className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add Manually
                </button>

                {/* Run Tests */}
                {testCases.length > 0 && (
                  <button
                    onClick={handleRunTests}
                    disabled={
                      running ||
                      activeRun?.status === "running" ||
                      activeRun?.status === "pending" ||
                      activeRun?.status === "paused"
                    }
                    className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {running ||
                    activeRun?.status === "running" ||
                    activeRun?.status === "pending" ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Running...
                      </>
                    ) : activeRun?.status === "paused" ? (
                      <>
                        <Pause className="w-3 h-3" />
                        Paused
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" />
                        {activeRun?.status === "completed" ||
                        activeRun?.status === "stopped"
                          ? "Re-run"
                          : "Run Tests"}
                      </>
                    )}
                  </button>
                )}

                {/* View latest results */}
                {activeRun?.status === "completed" && (
                  <button
                    onClick={() =>
                      router.push(`/agent-testing/runs/${activeRun.runId}`)
                    }
                    className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Results
                  </button>
                )}

                {/* Run history */}
                <button
                  onClick={() =>
                    router.push(`/agent-testing/configs/${configId}/results`)
                  }
                  className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/50 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <FlaskConical className="w-3 h-3" />
                  History
                </button>
              </div>
            </div>
          </div>

          {/* Run progress */}
          {activeRun && (
            <div className="mb-6">
              <DetailCard contentClassName="">
                <div className="space-y-3">
                  {/* Progress bar + counter + run controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          activeRun.status === "stopped"
                            ? "bg-red-500"
                            : activeRun.status === "paused"
                              ? "bg-yellow-500"
                              : activeRun.status === "failed"
                                ? "bg-red-500"
                                : "bg-green-500"
                        }`}
                        style={{
                          width: activeRun.totalCases
                            ? `${(activeRun.completedCases / activeRun.totalCases) * 100}%`
                            : "0%",
                        }}
                      />
                    </div>
                    <span className="text-xs text-white/40 shrink-0">
                      {activeRun.completedCases}/{activeRun.totalCases}
                      {activeRun.status === "completed" && (
                        <span className="ml-1.5 text-green-400">done</span>
                      )}
                      {activeRun.status === "failed" && (
                        <span className="ml-1.5 text-red-400">failed</span>
                      )}
                      {activeRun.status === "stopped" && (
                        <span className="ml-1.5 text-red-400">stopped</span>
                      )}
                      {activeRun.status === "paused" && (
                        <span className="ml-1.5 text-yellow-400">paused</span>
                      )}
                    </span>

                    {/* Pause / Resume / Stop controls — shown while run is active */}
                    {(activeRun.status === "running" ||
                      activeRun.status === "paused") && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {activeRun.status === "running" ? (
                          <button
                            onClick={handlePauseRun}
                            disabled={controllingRun}
                            title="Pause run"
                            className="cursor-pointer flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {controllingRun ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Pause className="w-3 h-3" />
                            )}
                            Pause
                          </button>
                        ) : (
                          <button
                            onClick={handleResumeRun}
                            disabled={controllingRun}
                            title="Resume run"
                            className="cursor-pointer flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {controllingRun ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                            Resume
                          </button>
                        )}
                        <button
                          onClick={handleStopRun}
                          disabled={controllingRun}
                          title="Stop run"
                          className="cursor-pointer flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {controllingRun ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Square className="w-3 h-3 fill-current" />
                          )}
                          Stop
                        </button>
                      </div>
                    )}
                  </div>

                  {activeRun.status === "paused" && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/8 border border-yellow-500/20">
                      <Pause className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      <span className="text-xs text-yellow-300/80">
                        Run is paused. Click{" "}
                        <span className="font-medium text-yellow-300">
                          Resume
                        </span>{" "}
                        to continue or{" "}
                        <span className="font-medium text-red-300">Stop</span>{" "}
                        to end the run.
                      </span>
                    </div>
                  )}

                  {inProgressResult && activeRun.status === "running" && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/8 border border-yellow-500/20">
                      <Loader2 className="w-3.5 h-3.5 text-yellow-400 animate-spin shrink-0" />
                      <span className="text-xs text-yellow-300/80 truncate">
                        Testing:{" "}
                        <span className="font-medium text-yellow-300">
                          {inProgressResult.testCase.title}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Per-result rows */}
                  <div className="space-y-1">
                    {activeRun.results.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/3 border border-white/8 text-xs"
                      >
                        <span className="shrink-0">
                          {r.status === "pending" &&
                          inProgressResult?.id === r.id ? (
                            <Loader2 className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
                          ) : r.status === "pending" ? (
                            <Clock className="w-3.5 h-3.5 text-white/30" />
                          ) : r.status === "success" ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                          )}
                        </span>
                        <span className="flex-1 text-white/75 truncate">
                          {r.testCase.title}
                        </span>
                        <span
                          className={`shrink-0 text-xs px-1.5 py-0.5 rounded border font-medium ${CATEGORY_COLORS[r.testCase.category] ?? "bg-white/5 text-white/40 border-white/10"}`}
                        >
                          {CATEGORY_LABELS[r.testCase.category] ??
                            r.testCase.category}
                        </span>
                        {r.latencyMs != null && (
                          <span className="shrink-0 text-white/30">
                            {r.latencyMs}ms
                          </span>
                        )}
                        {r.httpStatus != null && (
                          <span
                            className={`shrink-0 font-mono ${r.httpStatus >= 200 && r.httpStatus < 300 ? "text-green-400" : "text-red-400"}`}
                          >
                            {r.httpStatus}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </DetailCard>
            </div>
          )}

          {/* Add form */}
          {showAddForm && (
            <div className="mb-6">
              <DetailCard
                title="Add Test Case Manually"
                contentClassName="space-y-4"
              >
                <form onSubmit={handleAddSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category */}
                    <div className="space-y-2">
                      <Label htmlFor="add-category">Category</Label>
                      <div className="relative">
                        <select
                          id="add-category"
                          value={addForm.category}
                          onChange={(e) =>
                            setAddForm((f) => ({
                              ...f,
                              category: e.target.value as Category,
                            }))
                          }
                          className="cursor-pointer w-full appearance-none rounded-full border border-white/15 bg-[#0f0f12] px-4 py-2 pr-8 text-sm text-white/90 focus:border-primary focus:outline-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {CATEGORY_LABELS[c]}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                      </div>
                    </div>
                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="add-title">
                        Title <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="add-title"
                        type="text"
                        variant="glass"
                        value={addForm.title}
                        onChange={(e) =>
                          setAddForm((f) => ({ ...f, title: e.target.value }))
                        }
                        placeholder="Short descriptive title"
                      />
                      {addErrors.title && (
                        <p className="text-xs text-red-400">
                          {addErrors.title}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Input */}
                  <div className="space-y-2">
                    <Label htmlFor="add-input">
                      User Input <span className="text-red-400">*</span>
                    </Label>
                    <p className="text-xs text-white/40">
                      The exact message that will be sent to your agent.
                    </p>
                    <Textarea
                      id="add-input"
                      variant="glass"
                      rows={3}
                      value={addForm.input}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, input: e.target.value }))
                      }
                      placeholder="e.g. What is the refund policy for cancelled orders?"
                    />
                    {addErrors.input && (
                      <p className="text-xs text-red-400">{addErrors.input}</p>
                    )}
                  </div>

                  {/* Expected behavior */}
                  <div className="space-y-2">
                    <Label htmlFor="add-expected">
                      Expected Behavior <span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                      id="add-expected"
                      variant="glass"
                      rows={3}
                      value={addForm.expectedBehavior}
                      onChange={(e) =>
                        setAddForm((f) => ({
                          ...f,
                          expectedBehavior: e.target.value,
                        }))
                      }
                      placeholder="Describe what the agent should do or say."
                    />
                    {addErrors.expectedBehavior && (
                      <p className="text-xs text-red-400">
                        {addErrors.expectedBehavior}
                      </p>
                    )}
                  </div>

                  {/* Rubric */}
                  <div className="space-y-2">
                    <Label htmlFor="add-rubric">
                      Rubric Criteria <span className="text-red-400">*</span>
                    </Label>
                    <p className="text-xs text-white/40">
                      Pipe-separated pass/fail criteria, e.g.{" "}
                      <span className="font-mono text-white/50">
                        Mentions refund window | Does not hallucinate | Offers
                        next steps
                      </span>
                    </p>
                    <Textarea
                      id="add-rubric"
                      variant="glass"
                      rows={3}
                      value={addForm.rubric}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, rubric: e.target.value }))
                      }
                      placeholder="Criterion 1 | Criterion 2 | Criterion 3"
                    />
                    {addErrors.rubric && (
                      <p className="text-xs text-red-400">{addErrors.rubric}</p>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-1">
                    <ButtonPrimary
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowAddForm(false);
                        setAddForm(emptyForm);
                        setAddErrors({});
                      }}
                    >
                      Cancel
                    </ButtonPrimary>
                    <ButtonPrimary
                      type="submit"
                      disabled={addSubmitting}
                      buttonName="Add Test Case"
                    >
                      {addSubmitting ? (
                        <>
                          <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Add Test Case"
                      )}
                    </ButtonPrimary>
                  </div>
                </form>
              </DetailCard>
            </div>
          )}

          {/* Category filter tabs */}
          {testCases.length > 0 && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setFilterCategory("all")}
                className={`cursor-pointer text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  filterCategory === "all"
                    ? "bg-white/10 text-white border-white/20"
                    : "bg-white/3 text-white/50 border-white/10 hover:bg-white/8"
                }`}
              >
                All ({testCases.length})
              </button>
              {CATEGORIES.filter((c) => (categoryCounts[c] ?? 0) > 0).map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`cursor-pointer text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      filterCategory === cat
                        ? CATEGORY_COLORS[cat]
                        : "bg-white/3 text-white/50 border-white/10 hover:bg-white/8"
                    }`}
                  >
                    {CATEGORY_LABELS[cat]} ({categoryCounts[cat] ?? 0})
                  </button>
                ),
              )}
            </div>
          )}

          {/* Test cases list */}
          {testCases.length === 0 && !showAddForm ? (
            <DetailCard contentClassName="">
              <div className="py-12 flex flex-col items-center gap-4 text-center">
                <div className="p-3 rounded-full bg-white/5">
                  <FlaskConical className="w-8 h-8 text-white/30" />
                </div>
                <div>
                  <p className="font-medium text-white/70">No test cases yet</p>
                  <p className="text-sm text-white/40 mt-1">
                    Generate test cases automatically from your agent
                    description, or add them manually.
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={handleRegenerate}
                    disabled={generating}
                    className="cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition-colors disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate Tests
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Manually
                  </button>
                </div>
              </div>
            </DetailCard>
          ) : filtered.length === 0 && testCases.length > 0 ? (
            <p className="text-sm text-white/40 text-center py-8">
              No test cases in this category.
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((tc) => {
                const isEditing = editingId === tc.id;
                const isExpanded = expandedId === tc.id;

                if (isEditing) {
                  return (
                    <DetailCard key={tc.id} contentClassName="space-y-4">
                      <form
                        onSubmit={(e) => handleEditSubmit(e, tc.id)}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-white/70">
                            Editing test case
                          </p>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="cursor-pointer p-1 rounded text-white/30 hover:text-white/70 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`edit-cat-${tc.id}`}>
                              Category
                            </Label>
                            <div className="relative">
                              <select
                                id={`edit-cat-${tc.id}`}
                                value={editForm.category}
                                onChange={(e) =>
                                  setEditForm((f) => ({
                                    ...f,
                                    category: e.target.value as Category,
                                  }))
                                }
                                className="cursor-pointer w-full appearance-none rounded-full border border-white/15 bg-[#0f0f12] px-4 py-2 pr-8 text-sm text-white/90 focus:border-primary focus:outline-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                              >
                                {CATEGORIES.map((c) => (
                                  <option key={c} value={c}>
                                    {CATEGORY_LABELS[c]}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`edit-title-${tc.id}`}>
                              Title <span className="text-red-400">*</span>
                            </Label>
                            <Input
                              id={`edit-title-${tc.id}`}
                              type="text"
                              variant="glass"
                              value={editForm.title}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  title: e.target.value,
                                }))
                              }
                            />
                            {editErrors.title && (
                              <p className="text-xs text-red-400">
                                {editErrors.title}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`edit-input-${tc.id}`}>
                            User Input <span className="text-red-400">*</span>
                          </Label>
                          <Textarea
                            id={`edit-input-${tc.id}`}
                            variant="glass"
                            rows={3}
                            value={editForm.input}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                input: e.target.value,
                              }))
                            }
                          />
                          {editErrors.input && (
                            <p className="text-xs text-red-400">
                              {editErrors.input}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`edit-expected-${tc.id}`}>
                            Expected Behavior{" "}
                            <span className="text-red-400">*</span>
                          </Label>
                          <Textarea
                            id={`edit-expected-${tc.id}`}
                            variant="glass"
                            rows={3}
                            value={editForm.expectedBehavior}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                expectedBehavior: e.target.value,
                              }))
                            }
                          />
                          {editErrors.expectedBehavior && (
                            <p className="text-xs text-red-400">
                              {editErrors.expectedBehavior}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`edit-rubric-${tc.id}`}>
                            Rubric Criteria{" "}
                            <span className="text-red-400">*</span>
                          </Label>
                          <p className="text-xs text-white/40">
                            Pipe-separated pass/fail criteria.
                          </p>
                          <Textarea
                            id={`edit-rubric-${tc.id}`}
                            variant="glass"
                            rows={3}
                            value={editForm.rubric}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                rubric: e.target.value,
                              }))
                            }
                          />
                          {editErrors.rubric && (
                            <p className="text-xs text-red-400">
                              {editErrors.rubric}
                            </p>
                          )}
                        </div>

                        <div className="flex justify-end gap-3 pt-1">
                          <ButtonPrimary
                            type="button"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </ButtonPrimary>
                          <ButtonPrimary
                            type="submit"
                            disabled={editSubmitting}
                            buttonName="Save Test Case"
                          >
                            {editSubmitting ? (
                              <>
                                <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </ButtonPrimary>
                        </div>
                      </form>
                    </DetailCard>
                  );
                }

                const rubricItems = tc.rubric
                  .split("|")
                  .map((r) => r.trim())
                  .filter(Boolean);

                return (
                  <div
                    key={tc.id}
                    className="rounded-xl border border-white/10 bg-white/3 overflow-hidden"
                  >
                    {/* Row header */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <span
                        className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${CATEGORY_COLORS[tc.category] ?? "bg-white/5 text-white/40 border-white/10"}`}
                      >
                        {CATEGORY_LABELS[tc.category] ?? tc.category}
                      </span>
                      <span className="flex-1 text-sm text-white/85 truncate font-medium">
                        {tc.title}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() =>
                            setExpandedId(isExpanded ? null : tc.id)
                          }
                          className="cursor-pointer p-1.5 rounded text-white/30 hover:text-white/70 hover:bg-white/8 transition-colors"
                          title={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleStartEdit(tc)}
                          className="cursor-pointer p-1.5 rounded text-white/30 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tc)}
                          className="cursor-pointer p-1.5 rounded text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-white/8 space-y-4">
                        {/* Input */}
                        <div>
                          <p className="text-xs font-medium text-blue-400/70 uppercase tracking-wider mb-1.5">
                            User Input
                          </p>
                          <p className="text-sm text-white/75 bg-white/5 rounded-lg px-3 py-2">
                            {tc.input}
                          </p>
                        </div>

                        {/* Expected behavior */}
                        <div>
                          <p className="text-xs font-medium text-green-400/70 uppercase tracking-wider mb-1.5">
                            Expected Behavior
                          </p>
                          <p className="text-sm text-white/75 bg-white/5 rounded-lg px-3 py-2">
                            {tc.expectedBehavior}
                          </p>
                        </div>

                        {/* Rubric */}
                        <div>
                          <p className="text-xs font-medium text-purple-400/70 uppercase tracking-wider mb-1.5">
                            Rubric Criteria
                          </p>
                          <ul className="space-y-1">
                            {rubricItems.map((item, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm text-white/70"
                              >
                                <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
