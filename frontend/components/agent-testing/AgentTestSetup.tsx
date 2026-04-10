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
import { Input } from "@/frontend/reusable-elements/inputs/Input";
import { Textarea } from "@/frontend/reusable-elements/textareas/Textarea";
import { Label } from "@/frontend/reusable-elements/labels/Label";
import { ButtonPrimary } from "@/frontend/reusable-elements/buttons/ButtonPrimary";
import {
  Bot,
  Plus,
  Trash2,
  Pencil,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";

type AiProvider = "anthropic" | "google";

interface AgentTestConfig {
  id: string;
  name: string;
  agentApiUrl: string;
  langfusePublicKey: string;
  systemPrompt: string;
  aiProvider: AiProvider;
  createdAt: string;
  updatedAt: string;
}

interface AgentTestCase {
  id: string;
  configId: string;
  category: string;
  title: string;
  input: string;
  rubric: string;
  expectedBehavior: string;
  generatedAt: string;
}

interface AgentTestResultSummary {
  id: string;
  testCaseId: string;
  sessionId: string;
  status: "pending" | "success" | "error";
  requestPayload: string | null;
  agentResponse: string | null;
  httpStatus: number | null;
  latencyMs: number | null;
  errorMessage: string | null;
  executedAt: string;
  testCase: {
    title: string;
    category: string;
    input: string;
    expectedBehavior: string;
    rubric: string;
  };
}

interface AgentTestRunState {
  runId: string;
  status: "pending" | "running" | "completed" | "failed";
  totalCases: number;
  completedCases: number;
  startedAt: string;
  completedAt: string | null;
  results: AgentTestResultSummary[];
}

interface SetupFormData {
  name: string;
  agentApiUrl: string;
  langfusePublicKey: string;
  langfuseSecretKey: string;
  systemPrompt: string;
  aiProvider: AiProvider;
  aiApiKey: string;
}

const emptyForm: SetupFormData = {
  name: "",
  agentApiUrl: "",
  langfusePublicKey: "",
  langfuseSecretKey: "",
  systemPrompt: "",
  aiProvider: "anthropic",
  aiApiKey: "",
};

const CATEGORY_LABELS: Record<string, string> = {
  happy_path: "Happy Path",
  edge_case: "Edge Case",
  tool_use: "Tool Use",
  refusal: "Refusal",
  ambiguity: "Ambiguity",
  multi_turn: "Multi-Turn",
  regression: "Regression",
};

const CATEGORY_COLORS: Record<string, string> = {
  happy_path: "bg-green-500/10 text-green-400 border-green-500/20",
  edge_case: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  tool_use: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  refusal: "bg-red-500/10 text-red-400 border-red-500/20",
  ambiguity: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  multi_turn: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  regression: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export default function AgentTestSetup() {
  const router = useRouter();
  const { status } = useSession();

  const [configs, setConfigs] = useState<AgentTestConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SetupFormData>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Partial<SetupFormData>>({});
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  // Test case generation state
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [testCases, setTestCases] = useState<Record<string, AgentTestCase[]>>(
    {},
  );
  const [expandedConfig, setExpandedConfig] = useState<string | null>(null);
  const [expandedTestCase, setExpandedTestCase] = useState<string | null>(null);

  // Edit state
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SetupFormData>(emptyForm);
  const [editFieldErrors, setEditFieldErrors] = useState<
    Partial<SetupFormData>
  >({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Test run state
  const [activeRun, setActiveRun] = useState<Record<string, AgentTestRunState>>(
    {},
  );
  const [runningFor, setRunningFor] = useState<string | null>(null);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchConfigs();
    }
  }, [status]);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/agent-test-configs");
      if (!res.ok) throw new Error("Failed to load configurations");
      const data = await res.json();
      setConfigs(data?.data ?? []);
    } catch {
      setAlert({
        type: "error",
        title: "Error",
        message: "Failed to load agent test configurations.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTestCases = async (configId: string) => {
    try {
      const res = await fetch(
        `/api/agent-test-configs/${configId}/generate-tests`,
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data?.data?.length) {
        setTestCases((prev) => ({ ...prev, [configId]: data.data }));
      }
    } catch {
      // silently ignore — no prior test cases is fine
    }
  };

  const validate = (): boolean => {
    const errors: Partial<SetupFormData> = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.agentApiUrl.trim()) {
      errors.agentApiUrl = "Agent API URL is required";
    } else {
      try {
        new URL(form.agentApiUrl);
      } catch {
        errors.agentApiUrl = "Must be a valid URL";
      }
    }
    if (!form.langfusePublicKey.trim())
      errors.langfusePublicKey = "Langfuse public key is required";
    if (!form.langfuseSecretKey.trim())
      errors.langfuseSecretKey = "Langfuse secret key is required";
    if (!form.systemPrompt.trim())
      errors.systemPrompt = "System prompt is required";
    if (!form.aiApiKey.trim()) errors.aiApiKey = "AI API key is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/agent-test-configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to create configuration");

      setConfigs((prev) => [data.data, ...prev]);
      setForm(emptyForm);
      setFieldErrors({});
      setShowForm(false);
      setAlert({
        type: "success",
        title: "Saved",
        message: `"${data.data.name}" configuration saved successfully.`,
      });
    } catch (err) {
      setAlert({
        type: "error",
        title: "Error",
        message:
          err instanceof Error ? err.message : "Failed to save configuration.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete configuration "${name}"? This cannot be undone.`))
      return;
    try {
      const res = await fetch(`/api/agent-test-configs/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete configuration");
      setConfigs((prev) => prev.filter((c) => c.id !== id));
      setTestCases((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      if (expandedConfig === id) setExpandedConfig(null);
      setAlert({
        type: "success",
        title: "Deleted",
        message: `"${name}" deleted successfully.`,
      });
    } catch {
      setAlert({
        type: "error",
        title: "Error",
        message: "Failed to delete configuration.",
      });
    }
  };

  const handleStartEdit = (config: AgentTestConfig) => {
    setEditingConfigId(config.id);
    setEditForm({
      name: config.name,
      agentApiUrl: config.agentApiUrl,
      langfusePublicKey: config.langfusePublicKey,
      langfuseSecretKey: "",
      systemPrompt: config.systemPrompt,
      aiProvider: config.aiProvider,
      aiApiKey: "",
    });
    setEditFieldErrors({});
  };

  const handleCancelEdit = () => {
    setEditingConfigId(null);
    setEditForm(emptyForm);
    setEditFieldErrors({});
  };

  const validateEdit = (): boolean => {
    const errors: Partial<SetupFormData> = {};
    if (!editForm.name.trim()) errors.name = "Name is required";
    if (!editForm.agentApiUrl.trim()) {
      errors.agentApiUrl = "Agent API URL is required";
    } else {
      try {
        new URL(editForm.agentApiUrl);
      } catch {
        errors.agentApiUrl = "Must be a valid URL";
      }
    }
    if (!editForm.langfusePublicKey.trim())
      errors.langfusePublicKey = "Langfuse public key is required";
    if (!editForm.systemPrompt.trim())
      errors.systemPrompt = "System prompt is required";
    setEditFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e: React.FormEvent, configId: string) => {
    e.preventDefault();
    if (!validateEdit()) return;

    setEditSubmitting(true);
    try {
      const body: Partial<SetupFormData> = {
        name: editForm.name,
        agentApiUrl: editForm.agentApiUrl,
        langfusePublicKey: editForm.langfusePublicKey,
        systemPrompt: editForm.systemPrompt,
        aiProvider: editForm.aiProvider,
      };
      // Only send secrets if the user typed a new value
      if (editForm.langfuseSecretKey.trim())
        body.langfuseSecretKey = editForm.langfuseSecretKey;
      if (editForm.aiApiKey.trim()) body.aiApiKey = editForm.aiApiKey;

      const res = await fetch(`/api/agent-test-configs/${configId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to update configuration");

      setConfigs((prev) =>
        prev.map((c) => (c.id === configId ? data.data : c)),
      );
      setEditingConfigId(null);
      setEditForm(emptyForm);
      setAlert({
        type: "success",
        title: "Updated",
        message: `"${data.data.name}" updated successfully.`,
      });
    } catch (err) {
      setAlert({
        type: "error",
        title: "Error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to update configuration.",
      });
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleGenerateTests = async (config: AgentTestConfig) => {
    setGeneratingFor(config.id);
    try {
      const res = await fetch(
        `/api/agent-test-configs/${config.id}/generate-tests`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to generate test cases");

      setTestCases((prev) => ({ ...prev, [config.id]: data.data }));
      setExpandedConfig(config.id);
      setAlert({
        type: "success",
        title: "Generated",
        message: `${data.data.length} test cases generated for "${config.name}".`,
      });
    } catch (err) {
      setAlert({
        type: "error",
        title: "Generation Failed",
        message:
          err instanceof Error ? err.message : "Failed to generate test cases.",
      });
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleToggleExpand = async (configId: string) => {
    if (expandedConfig === configId) {
      setExpandedConfig(null);
      return;
    }
    setExpandedConfig(configId);
    if (!testCases[configId]) {
      await fetchTestCases(configId);
    }
  };

  const handleRunTests = async (config: AgentTestConfig) => {
    setRunningFor(config.id);
    try {
      const res = await fetch(
        `/api/agent-test-configs/${config.id}/run-tests`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to start test run");

      const run: AgentTestRunState = data.data;
      setActiveRun((prev) => ({ ...prev, [config.id]: run }));

      // Poll until completed
      const poll = async (runId: string, configId: string) => {
        try {
          const pollRes = await fetch(`/api/agent-test-runs/${runId}`);
          if (pollRes.ok) {
            const pollData = await pollRes.json();
            const updated: AgentTestRunState = pollData.data;
            setActiveRun((prev) => ({ ...prev, [configId]: updated }));
            if (updated.status === "running" || updated.status === "pending") {
              setTimeout(() => poll(runId, configId), 2000);
            } else {
              setRunningFor(null);
            }
            return;
          }
        } catch {
          // network hiccup — retry
        }
        // retry on any error so we don't silently stop polling
        setTimeout(() => poll(runId, configId), 3000);
      };

      if (run.status === "running" || run.status === "pending") {
        setTimeout(() => poll(run.runId, config.id), 2500);
      } else {
        setRunningFor(null);
      }
    } catch (err) {
      setRunningFor(null);
      setAlert({
        type: "error",
        title: "Run Failed",
        message:
          err instanceof Error ? err.message : "Failed to start test run.",
      });
    }
  };

  // Group test cases by category
  const groupByCategory = (cases: AgentTestCase[]) => {
    return cases.reduce(
      (acc, tc) => {
        if (!acc[tc.category]) acc[tc.category] = [];
        acc[tc.category].push(tc);
        return acc;
      },
      {} as Record<string, AgentTestCase[]>,
    );
  };

  const navbarActions = [
    {
      type: "action" as const,
      label: "+ New Configuration",
      onClick: () => setShowForm(true),
      variant: "primary" as const,
      buttonName: "Agent Test Setup - New Configuration",
    },
    { type: "signout" as const, showConfirmation: true },
  ];

  if (status === "loading" || loading) {
    return <Loader fullScreen text="Loading configurations..." />;
  }

  return (
    <div className="flex-1">
      <Navbar
        brandLabel={null}
        items={[]}
        breadcrumbs={
          <span className="flex items-center gap-1 text-sm text-white/50">
            <span>Agent Testing</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/90 font-medium">Setup</span>
          </span>
        }
        actions={navbarActions}
      />

      <div className="px-8 pt-8 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Bot className="w-6 h-6 text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold text-white">
                Agent Testing Setup
              </h1>
            </div>
            <p className="text-white/60 ml-14">
              Configure your agent API endpoint, Langfuse keys, and agent
              description. Each configuration is used to generate test cases and
              score agent responses.
            </p>
          </div>

          {/* Setup Form */}
          {showForm && (
            <div className="mb-8">
              <DetailCard
                title="New Configuration"
                contentClassName="space-y-5"
              >
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="config-name">
                      Configuration Name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="config-name"
                      type="text"
                      variant="glass"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="e.g. Customer Support Agent v2"
                    />
                    {fieldErrors.name && (
                      <p className="text-xs text-red-400">{fieldErrors.name}</p>
                    )}
                  </div>

                  {/* Agent API URL */}
                  <div className="space-y-2">
                    <Label htmlFor="agent-api-url">
                      Agent Base URL <span className="text-red-400">*</span>
                    </Label>
                    <p className="text-xs text-white/40">
                      The root URL of your agent. Test cases will be sent to{" "}
                      <span className="text-white/60 font-mono">/api/chat</span>{" "}
                      on this base URL.
                    </p>
                    <Input
                      id="agent-api-url"
                      type="url"
                      variant="glass"
                      value={form.agentApiUrl}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, agentApiUrl: e.target.value }))
                      }
                      placeholder="https://your-agent.example.com"
                    />
                    {fieldErrors.agentApiUrl && (
                      <p className="text-xs text-red-400">
                        {fieldErrors.agentApiUrl}
                      </p>
                    )}
                  </div>

                  {/* Langfuse Keys */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="langfuse-public-key">
                        Langfuse Public Key{" "}
                        <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="langfuse-public-key"
                        type="text"
                        variant="glass"
                        value={form.langfusePublicKey}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            langfusePublicKey: e.target.value,
                          }))
                        }
                        placeholder="pk-lf-..."
                      />
                      {fieldErrors.langfusePublicKey && (
                        <p className="text-xs text-red-400">
                          {fieldErrors.langfusePublicKey}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="langfuse-secret-key">
                        Langfuse Secret Key{" "}
                        <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="langfuse-secret-key"
                        type="password"
                        variant="glass"
                        value={form.langfuseSecretKey}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            langfuseSecretKey: e.target.value,
                          }))
                        }
                        placeholder="sk-lf-..."
                      />
                      {fieldErrors.langfuseSecretKey && (
                        <p className="text-xs text-red-400">
                          {fieldErrors.langfuseSecretKey}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* AI Provider */}
                  <div className="space-y-3">
                    <Label>
                      AI Provider for Test Generation &amp; Scoring{" "}
                      <span className="text-red-400">*</span>
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(
                        [
                          {
                            value: "anthropic",
                            label: "Anthropic",
                            sublabel: "Claude (Opus / Haiku)",
                            placeholder: "sk-ant-api03-...",
                          },
                          {
                            value: "google",
                            label: "Google AI Studio",
                            sublabel: "Gemini (Pro / Flash)",
                            placeholder: "AIza...",
                          },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            setForm((f) => ({ ...f, aiProvider: opt.value }))
                          }
                          className={`cursor-pointer text-left px-4 py-3 rounded-lg border transition-colors ${
                            form.aiProvider === opt.value
                              ? "border-blue-500/60 bg-blue-500/10 text-white"
                              : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/80"
                          }`}
                        >
                          <div className="font-medium text-sm">{opt.label}</div>
                          <div className="text-xs mt-0.5 opacity-60">
                            {opt.sublabel}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI API Key */}
                  <div className="space-y-2">
                    <Label htmlFor="ai-api-key">
                      {form.aiProvider === "google"
                        ? "Google AI Studio API Key"
                        : "Anthropic API Key"}{" "}
                      <span className="text-red-400">*</span>
                    </Label>
                    <p className="text-xs text-white/40">
                      {form.aiProvider === "google"
                        ? "Your Google AI Studio API key — used to generate test cases and score agent responses with Gemini."
                        : "Your Anthropic API key — used to generate test cases and score agent responses with Claude."}
                    </p>
                    <Input
                      id="ai-api-key"
                      type="password"
                      variant="glass"
                      value={form.aiApiKey}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, aiApiKey: e.target.value }))
                      }
                      placeholder={
                        form.aiProvider === "google" ? "AIza..." : "sk-ant-..."
                      }
                    />
                    {fieldErrors.aiApiKey && (
                      <p className="text-xs text-red-400">
                        {fieldErrors.aiApiKey}
                      </p>
                    )}
                  </div>

                  {/* System Prompt / Agent Description */}
                  <div className="space-y-2">
                    <Label htmlFor="system-prompt">
                      Agent Description <span className="text-red-400">*</span>
                    </Label>
                    <p className="text-xs text-white/40">
                      Paste anything that describes your agent — system prompt,
                      tool list, skill catalogue, API docs, or all of the above.
                      The more detail you provide, the more accurate and
                      domain-specific the generated test cases will be.
                    </p>
                    <Textarea
                      id="system-prompt"
                      variant="glass"
                      rows={10}
                      value={form.systemPrompt}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          systemPrompt: e.target.value,
                        }))
                      }
                      placeholder="Paste your agent's full description here — system prompt, available tools, skills, API endpoints, supported models, constraints, etc."
                    />
                    {fieldErrors.systemPrompt && (
                      <p className="text-xs text-red-400">
                        {fieldErrors.systemPrompt}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <ButtonPrimary
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowForm(false);
                        setForm(emptyForm);
                        setFieldErrors({});
                      }}
                    >
                      Cancel
                    </ButtonPrimary>
                    <ButtonPrimary
                      type="submit"
                      disabled={submitting}
                      buttonName="Agent Test Setup - Save Configuration"
                    >
                      {submitting ? (
                        <>
                          <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Configuration"
                      )}
                    </ButtonPrimary>
                  </div>
                </form>
              </DetailCard>
            </div>
          )}

          {/* Configurations List */}
          {configs.length === 0 && !showForm ? (
            <DetailCard contentClassName="">
              <div className="py-12 flex flex-col items-center gap-4 text-center">
                <div className="p-3 rounded-full bg-white/5">
                  <Bot className="w-8 h-8 text-white/30" />
                </div>
                <div>
                  <p className="font-medium text-white/70">
                    No configurations yet
                  </p>
                  <p className="text-sm text-white/40 mt-1">
                    Add your first agent configuration to get started.
                  </p>
                </div>
                <ButtonPrimary
                  onClick={() => setShowForm(true)}
                  buttonName="Agent Test Setup - New Configuration (empty state)"
                  className="mt-2 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Configuration
                </ButtonPrimary>
              </div>
            </DetailCard>
          ) : (
            <div className="space-y-4">
              {configs.map((config) => {
                const cases = testCases[config.id] ?? [];
                const isExpanded = expandedConfig === config.id;
                const isGenerating = generatingFor === config.id;
                const isRunning = runningFor === config.id;
                const isEditing = editingConfigId === config.id;
                const run = activeRun[config.id] ?? null;
                const grouped = groupByCategory(cases);
                const inProgressResult =
                  run?.status === "running"
                    ? (run.results.find((r) => r.status === "pending") ?? null)
                    : null;

                return (
                  <DetailCard key={config.id} contentClassName="">
                    {/* Config Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white truncate">
                            {config.name}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${
                              config.aiProvider === "google"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                            }`}
                          >
                            {config.aiProvider === "google"
                              ? "Gemini"
                              : "Claude"}
                          </span>
                          {cases.length > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {cases.length} tests
                            </span>
                          )}
                        </div>
                        <a
                          href={config.agentApiUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline truncate max-w-sm cursor-pointer"
                        >
                          {config.agentApiUrl}
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                        <p className="mt-2 text-xs text-white/40 line-clamp-2">
                          {config.systemPrompt}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Generate Tests Button */}
                        <button
                          onClick={() => handleGenerateTests(config)}
                          disabled={isGenerating}
                          className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Generate test cases from system prompt"
                        >
                          {isGenerating ? (
                            <>
                              <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3" />
                              {cases.length > 0
                                ? "Re-generate"
                                : "Generate Tests"}
                            </>
                          )}
                        </button>

                        {/* Run Tests Button */}
                        {cases.length > 0 && (
                          <button
                            onClick={() => handleRunTests(config)}
                            disabled={isRunning || run?.status === "running"}
                            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Call agent API with each test case"
                          >
                            {isRunning || run?.status === "running" ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Running...
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3" />
                                {run?.status === "completed"
                                  ? "Re-run"
                                  : "Run Tests"}
                              </>
                            )}
                          </button>
                        )}

                        {/* Expand/Collapse test cases */}
                        {cases.length > 0 && (
                          <button
                            onClick={() => handleToggleExpand(config.id)}
                            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/60 hover:bg-white/10 border border-white/10 transition-colors"
                            title={isExpanded ? "Hide tests" : "View tests"}
                          >
                            <FlaskConical className="w-3 h-3" />
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        )}

                        <button
                          onClick={() =>
                            isEditing
                              ? handleCancelEdit()
                              : handleStartEdit(config)
                          }
                          className={`cursor-pointer p-2 rounded-lg transition-colors ${
                            isEditing
                              ? "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
                              : "text-white/30 hover:text-blue-400 hover:bg-blue-500/10"
                          }`}
                          title={
                            isEditing ? "Cancel edit" : "Edit configuration"
                          }
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(config.id, config.name)}
                          className="cursor-pointer p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete configuration"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Edit Form */}
                    {isEditing && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <form
                          onSubmit={(e) => handleEditSubmit(e, config.id)}
                          className="space-y-5"
                        >
                          {/* Name */}
                          <div className="space-y-2">
                            <Label htmlFor={`edit-name-${config.id}`}>
                              Configuration Name{" "}
                              <span className="text-red-400">*</span>
                            </Label>
                            <Input
                              id={`edit-name-${config.id}`}
                              type="text"
                              variant="glass"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  name: e.target.value,
                                }))
                              }
                              placeholder="e.g. Customer Support Agent v2"
                            />
                            {editFieldErrors.name && (
                              <p className="text-xs text-red-400">
                                {editFieldErrors.name}
                              </p>
                            )}
                          </div>

                          {/* Agent API URL */}
                          <div className="space-y-2">
                            <Label htmlFor={`edit-url-${config.id}`}>
                              Agent Base URL{" "}
                              <span className="text-red-400">*</span>
                            </Label>
                            <Input
                              id={`edit-url-${config.id}`}
                              type="url"
                              variant="glass"
                              value={editForm.agentApiUrl}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  agentApiUrl: e.target.value,
                                }))
                              }
                              placeholder="https://your-agent.example.com"
                            />
                            {editFieldErrors.agentApiUrl && (
                              <p className="text-xs text-red-400">
                                {editFieldErrors.agentApiUrl}
                              </p>
                            )}
                          </div>

                          {/* Langfuse Keys */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`edit-lf-pub-${config.id}`}>
                                Langfuse Public Key{" "}
                                <span className="text-red-400">*</span>
                              </Label>
                              <Input
                                id={`edit-lf-pub-${config.id}`}
                                type="text"
                                variant="glass"
                                value={editForm.langfusePublicKey}
                                onChange={(e) =>
                                  setEditForm((f) => ({
                                    ...f,
                                    langfusePublicKey: e.target.value,
                                  }))
                                }
                                placeholder="pk-lf-..."
                              />
                              {editFieldErrors.langfusePublicKey && (
                                <p className="text-xs text-red-400">
                                  {editFieldErrors.langfusePublicKey}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`edit-lf-sec-${config.id}`}>
                                Langfuse Secret Key
                              </Label>
                              <Input
                                id={`edit-lf-sec-${config.id}`}
                                type="password"
                                variant="glass"
                                value={editForm.langfuseSecretKey}
                                onChange={(e) =>
                                  setEditForm((f) => ({
                                    ...f,
                                    langfuseSecretKey: e.target.value,
                                  }))
                                }
                                placeholder="Leave blank to keep existing"
                              />
                            </div>
                          </div>

                          {/* AI Provider */}
                          <div className="space-y-3">
                            <Label>
                              AI Provider for Test Generation &amp; Scoring{" "}
                              <span className="text-red-400">*</span>
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {(
                                [
                                  {
                                    value: "anthropic",
                                    label: "Anthropic",
                                    sublabel: "Claude (Opus / Haiku)",
                                  },
                                  {
                                    value: "google",
                                    label: "Google AI Studio",
                                    sublabel: "Gemini (Pro / Flash)",
                                  },
                                ] as const
                              ).map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() =>
                                    setEditForm((f) => ({
                                      ...f,
                                      aiProvider: opt.value,
                                    }))
                                  }
                                  className={`cursor-pointer text-left px-4 py-3 rounded-lg border transition-colors ${
                                    editForm.aiProvider === opt.value
                                      ? "border-blue-500/60 bg-blue-500/10 text-white"
                                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/80"
                                  }`}
                                >
                                  <div className="font-medium text-sm">
                                    {opt.label}
                                  </div>
                                  <div className="text-xs mt-0.5 opacity-60">
                                    {opt.sublabel}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* AI API Key */}
                          <div className="space-y-2">
                            <Label htmlFor={`edit-ai-key-${config.id}`}>
                              {editForm.aiProvider === "google"
                                ? "Google AI Studio API Key"
                                : "Anthropic API Key"}
                            </Label>
                            <Input
                              id={`edit-ai-key-${config.id}`}
                              type="password"
                              variant="glass"
                              value={editForm.aiApiKey}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  aiApiKey: e.target.value,
                                }))
                              }
                              placeholder="Leave blank to keep existing"
                            />
                          </div>

                          {/* System Prompt */}
                          <div className="space-y-2">
                            <Label htmlFor={`edit-prompt-${config.id}`}>
                              Agent Description{" "}
                              <span className="text-red-400">*</span>
                            </Label>
                            <Textarea
                              id={`edit-prompt-${config.id}`}
                              variant="glass"
                              rows={10}
                              value={editForm.systemPrompt}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  systemPrompt: e.target.value,
                                }))
                              }
                              placeholder="Paste your agent's full description here..."
                            />
                            {editFieldErrors.systemPrompt && (
                              <p className="text-xs text-red-400">
                                {editFieldErrors.systemPrompt}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex justify-end gap-3 pt-2">
                            <ButtonPrimary
                              type="button"
                              variant="ghost"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </ButtonPrimary>
                            <ButtonPrimary
                              type="submit"
                              disabled={editSubmitting}
                              buttonName="Agent Test Setup - Save Edit"
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
                      </div>
                    )}

                    {/* Run Progress + Results Panel */}
                    {run && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        {/* Progress bar + View Results link */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-green-500 transition-all duration-500"
                              style={{
                                width: run.totalCases
                                  ? `${(run.completedCases / run.totalCases) * 100}%`
                                  : "0%",
                              }}
                            />
                          </div>
                          <span className="text-xs text-white/40 shrink-0">
                            {run.completedCases}/{run.totalCases}
                            {run.status === "completed" && (
                              <span className="ml-1.5 text-green-400">
                                done
                              </span>
                            )}
                            {run.status === "failed" && (
                              <span className="ml-1.5 text-red-400">
                                failed
                              </span>
                            )}
                          </span>
                          {run.status === "completed" && (
                            <button
                              onClick={() =>
                                router.push(`/agent-testing/runs/${run.runId}`)
                              }
                              className="cursor-pointer flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors shrink-0"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View Results
                            </button>
                          )}
                        </div>

                        {/* Live "currently testing" banner */}
                        {inProgressResult && (
                          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-yellow-500/8 border border-yellow-500/20">
                            <Loader2 className="w-3.5 h-3.5 text-yellow-400 animate-spin shrink-0" />
                            <span className="text-xs text-yellow-300/80 truncate">
                              Testing:{" "}
                              <span className="font-medium text-yellow-300">
                                {inProgressResult.testCase.title}
                              </span>
                            </span>
                            <span
                              className={`ml-auto shrink-0 text-xs px-1.5 py-0.5 rounded border font-medium ${CATEGORY_COLORS[inProgressResult.testCase.category] ?? "bg-white/5 text-white/40 border-white/10"}`}
                            >
                              {CATEGORY_LABELS[
                                inProgressResult.testCase.category
                              ] ?? inProgressResult.testCase.category}
                            </span>
                          </div>
                        )}

                        {/* Per-result rows */}
                        <div className="space-y-1.5">
                          {run.results.map((result) => {
                            const isResultOpen = expandedResult === result.id;
                            return (
                              <div
                                key={result.id}
                                className="rounded-lg border border-white/8 bg-white/3 overflow-hidden"
                              >
                                <button
                                  onClick={() =>
                                    setExpandedResult(
                                      isResultOpen ? null : result.id,
                                    )
                                  }
                                  className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
                                >
                                  {/* Status icon */}
                                  <span className="shrink-0">
                                    {result.status === "pending" &&
                                    inProgressResult?.id === result.id ? (
                                      <Loader2 className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
                                    ) : result.status === "pending" ? (
                                      <Clock className="w-3.5 h-3.5 text-white/30" />
                                    ) : result.status === "success" ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                                    ) : (
                                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                                    )}
                                  </span>

                                  <span className="flex-1 text-xs text-white/75 truncate">
                                    {result.testCase.title}
                                  </span>

                                  <span
                                    className={`shrink-0 text-xs px-1.5 py-0.5 rounded border font-medium ${CATEGORY_COLORS[result.testCase.category] ?? "bg-white/5 text-white/40 border-white/10"}`}
                                  >
                                    {CATEGORY_LABELS[
                                      result.testCase.category
                                    ] ?? result.testCase.category}
                                  </span>

                                  {result.latencyMs != null && (
                                    <span className="shrink-0 text-xs text-white/30">
                                      {result.latencyMs}ms
                                    </span>
                                  )}

                                  {result.httpStatus != null && (
                                    <span
                                      className={`shrink-0 text-xs font-mono ${result.httpStatus >= 200 && result.httpStatus < 300 ? "text-green-400" : "text-red-400"}`}
                                    >
                                      {result.httpStatus}
                                    </span>
                                  )}

                                  {isResultOpen ? (
                                    <ChevronUp className="w-3 h-3 text-white/30 shrink-0" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3 text-white/30 shrink-0" />
                                  )}
                                </button>

                                {isResultOpen && (
                                  <div className="px-4 pb-4 pt-3 border-t border-white/8 space-y-3">
                                    {/* Request */}
                                    <div>
                                      <p className="text-xs font-medium text-blue-400/70 uppercase tracking-wider mb-1.5">
                                        Request
                                      </p>
                                      {result.requestPayload ? (
                                        (() => {
                                          try {
                                            const parsed = JSON.parse(
                                              result.requestPayload,
                                            );
                                            return (
                                              <div className="space-y-1.5">
                                                <p className="text-xs text-white/40 font-mono bg-white/5 rounded px-3 py-1.5">
                                                  POST {parsed.url}
                                                </p>
                                                <pre className="text-xs text-white/70 bg-white/5 rounded px-3 py-2 overflow-x-auto whitespace-pre-wrap max-h-40">
                                                  {JSON.stringify(
                                                    parsed.body,
                                                    null,
                                                    2,
                                                  )}
                                                </pre>
                                              </div>
                                            );
                                          } catch {
                                            return (
                                              <pre className="text-xs text-white/70 bg-white/5 rounded px-3 py-2 overflow-x-auto whitespace-pre-wrap max-h-40">
                                                {result.requestPayload}
                                              </pre>
                                            );
                                          }
                                        })()
                                      ) : (
                                        <p className="text-xs text-white/30 italic">
                                          Not yet sent
                                        </p>
                                      )}
                                    </div>

                                    {/* Response */}
                                    <div>
                                      <p className="text-xs font-medium text-green-400/70 uppercase tracking-wider mb-1.5">
                                        Response
                                        {result.httpStatus != null && (
                                          <span
                                            className={`ml-2 font-mono ${result.httpStatus >= 200 && result.httpStatus < 300 ? "text-green-400" : "text-red-400"}`}
                                          >
                                            {result.httpStatus}
                                          </span>
                                        )}
                                        {result.latencyMs != null && (
                                          <span className="ml-2 text-white/30 font-mono">
                                            {result.latencyMs}ms
                                          </span>
                                        )}
                                      </p>
                                      {result.agentResponse ? (
                                        <pre className="text-xs text-white/70 bg-white/5 rounded px-3 py-2 overflow-x-auto whitespace-pre-wrap max-h-48">
                                          {(() => {
                                            try {
                                              return JSON.stringify(
                                                JSON.parse(
                                                  result.agentResponse,
                                                ),
                                                null,
                                                2,
                                              );
                                            } catch {
                                              return result.agentResponse;
                                            }
                                          })()}
                                        </pre>
                                      ) : result.errorMessage ? (
                                        <p className="text-xs text-red-300 bg-red-500/10 rounded px-3 py-2">
                                          {result.errorMessage}
                                        </p>
                                      ) : (
                                        <p className="text-xs text-white/30 italic">
                                          Waiting for response...
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Test Cases Panel */}
                    {isExpanded && cases.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2 mb-4">
                          <FlaskConical className="w-4 h-4 text-white/40" />
                          <span className="text-sm font-medium text-white/70">
                            Generated Test Cases
                          </span>
                          <span className="text-xs text-white/30">
                            ({cases.length} across {Object.keys(grouped).length}{" "}
                            categories)
                          </span>
                        </div>

                        <div className="space-y-4">
                          {Object.entries(grouped).map(
                            ([category, categoryCases]) => (
                              <div key={category}>
                                <div className="flex items-center gap-2 mb-2">
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CATEGORY_COLORS[category] ?? "bg-white/5 text-white/50 border-white/10"}`}
                                  >
                                    {CATEGORY_LABELS[category] ?? category}
                                  </span>
                                  <span className="text-xs text-white/30">
                                    {categoryCases.length} test
                                    {categoryCases.length !== 1 ? "s" : ""}
                                  </span>
                                </div>

                                <div className="space-y-2 ml-1">
                                  {categoryCases.map((tc) => {
                                    const isOpen = expandedTestCase === tc.id;
                                    return (
                                      <div
                                        key={tc.id}
                                        className="rounded-lg border border-white/8 bg-white/3 overflow-hidden"
                                      >
                                        <button
                                          onClick={() =>
                                            setExpandedTestCase(
                                              isOpen ? null : tc.id,
                                            )
                                          }
                                          className="cursor-pointer w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                                        >
                                          <span className="text-sm text-white/80 font-medium">
                                            {tc.title}
                                          </span>
                                          {isOpen ? (
                                            <ChevronUp className="w-3.5 h-3.5 text-white/30 shrink-0" />
                                          ) : (
                                            <ChevronDown className="w-3.5 h-3.5 text-white/30 shrink-0" />
                                          )}
                                        </button>

                                        {isOpen && (
                                          <div className="px-4 pb-4 space-y-3 border-t border-white/8">
                                            <div className="pt-3">
                                              <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1">
                                                Target URL
                                              </p>
                                              <a
                                                href={config.agentApiUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:underline font-mono bg-white/5 rounded-md px-3 py-2 w-full truncate cursor-pointer"
                                              >
                                                <ExternalLink className="w-3 h-3 shrink-0" />
                                                {config.agentApiUrl}
                                              </a>
                                            </div>
                                            <div>
                                              <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1">
                                                Input
                                              </p>
                                              <p className="text-sm text-white/80 bg-white/5 rounded-md px-3 py-2 font-mono whitespace-pre-wrap">
                                                {tc.input}
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1">
                                                Expected Behavior
                                              </p>
                                              <p className="text-sm text-white/70">
                                                {tc.expectedBehavior}
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1">
                                                Rubric
                                              </p>
                                              <ul className="space-y-1">
                                                {tc.rubric
                                                  .split("|")
                                                  .map((criterion, i) => (
                                                    <li
                                                      key={i}
                                                      className="flex items-start gap-2 text-sm text-white/60"
                                                    >
                                                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
                                                      {criterion.trim()}
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
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </DetailCard>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />
    </div>
  );
}
