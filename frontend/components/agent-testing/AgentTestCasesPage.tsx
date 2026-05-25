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
  ChevronRight,
  Sparkles,
  Plus,
  Trash2,
  Pencil,
  Play,
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
  MessageSquare,
} from "lucide-react";
import {
  type AgentTestCase,
  type AgentTestConfig,
  type AgentTestCaseTurn,
  type PerTurnResult,
  type PerTurnRubricScore,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  DIMENSION_LABELS,
  DIMENSION_COLORS,
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
  status: "pending" | "running" | "completed" | "failed";
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
    requestPayload: string | null;
    agentResponse: string | null;
    testCase: { title: string; category: string; dimension: string | null; turns: string | null };
  }[];
}

interface TestCaseFormData {
  category: Category;
  dimension: string | null;
  title: string;
  input: string;
  rubric: string;
  expectedBehavior: string;
  turns: AgentTestCaseTurn[];
}

const emptyForm: TestCaseFormData = {
  category: "happy_path",
  dimension: null,
  title: "",
  input: "",
  rubric: "",
  expectedBehavior: "",
  turns: [],
};

interface Props {
  configId: string;
}

// ─── Multi-turn result panel ──────────────────────────────────────────────────

function MultiTurnResultPanel({
  requestPayload,
  agentResponse,
}: {
  requestPayload: string | null;
  agentResponse: string | null;
}) {
  let turnResults: PerTurnResult[] = [];
  try {
    if (agentResponse) {
      const parsed = JSON.parse(agentResponse) as Array<{
        turn: number;
        userMessage: string;
        response: string | null;
      }>;
      let requestParsed: Array<{
        turn: number;
        url: string;
        body: unknown;
      }> = [];
      try {
        if (requestPayload) requestParsed = JSON.parse(requestPayload);
      } catch { /* */ }

      turnResults = parsed.map((t) => {
        const req = requestParsed.find((r) => r.turn === t.turn);
        return {
          turn: t.turn,
          userMessage: t.userMessage,
          httpStatus: null,
          latencyMs: null,
          response: t.response,
          requestUrl: req?.url ?? null,
          requestBody: req?.body ?? null,
          errorMessage: null,
        };
      });
    }
  } catch { /* */ }

  if (turnResults.length === 0) {
    return (
      <p className="text-xs text-white/25 italic px-4 py-3">
        No turn data available
      </p>
    );
  }

  return (
    <div className="p-3 space-y-3">
      {turnResults.map((t) => (
        <div key={t.turn} className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
              Turn {t.turn}
            </span>
            {t.turn === 1 && (
              <span className="text-xs text-white/30 italic">opening</span>
            )}
          </div>
          {/* User message */}
          <div className="rounded-lg bg-blue-500/8 border border-blue-500/15 px-3 py-2">
            <p className="text-xs text-blue-300/60 font-medium mb-0.5">User</p>
            <p className="text-xs text-white/70">{t.userMessage}</p>
          </div>
          {/* Agent response */}
          <div className="rounded-lg bg-white/4 border border-white/8 px-3 py-2">
            <p className="text-xs text-green-400/60 font-medium mb-0.5">
              Agent
            </p>
            {t.response ? (
              <pre className="text-xs text-white/65 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-40 overflow-y-auto">
                {t.response}
              </pre>
            ) : (
              <p className="text-xs text-white/25 italic">No response</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Turns editor ─────────────────────────────────────────────────────────────

function TurnsEditor({
  turns,
  onChange,
  errors,
}: {
  turns: AgentTestCaseTurn[];
  onChange: (turns: AgentTestCaseTurn[]) => void;
  errors: Record<string, string>;
}) {
  const addTurn = () => {
    onChange([
      ...turns,
      {
        turnNumber: turns.length + 2,
        userMessage: "",
        expectedBehavior: "",
        rubric: "",
      },
    ]);
  };

  const removeTurn = (index: number) => {
    onChange(
      turns
        .filter((_, i) => i !== index)
        .map((t, i) => ({ ...t, turnNumber: i + 2 })),
    );
  };

  const updateTurn = (
    index: number,
    field: keyof AgentTestCaseTurn,
    value: string,
  ) => {
    onChange(
      turns.map((t, i) =>
        i === index ? { ...t, [field]: value } : t,
      ),
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>
          Follow-up Turns{" "}
          <span className="text-red-400">*</span>
        </Label>
        <button
          type="button"
          onClick={addTurn}
          className="cursor-pointer flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add Turn
        </button>
      </div>
      <p className="text-xs text-white/40">
        Define each follow-up turn (Turn 2 onwards). Turn 1 is the opening
        message above.
      </p>
      {errors.turns && (
        <p className="text-xs text-red-400">{errors.turns}</p>
      )}
      {turns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 py-6 flex flex-col items-center gap-2 text-center">
          <MessageSquare className="w-5 h-5 text-white/20" />
          <p className="text-xs text-white/30">
            No follow-up turns yet — click &ldquo;Add Turn&rdquo; above
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {turns.map((turn, index) => (
            <div
              key={index}
              className="rounded-xl border border-purple-500/20 bg-purple-500/3 p-3 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-400">
                  Turn {turn.turnNumber}
                </span>
                <button
                  type="button"
                  onClick={() => removeTurn(index)}
                  className="cursor-pointer p-1 rounded text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`turn-${index}-msg`} className="text-xs">
                  User Message <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  id={`turn-${index}-msg`}
                  variant="glass"
                  rows={2}
                  value={turn.userMessage}
                  onChange={(e) =>
                    updateTurn(index, "userMessage", e.target.value)
                  }
                  placeholder={`What the user says in Turn ${turn.turnNumber}`}
                />
                {errors[`turns.${index}.userMessage`] && (
                  <p className="text-xs text-red-400">
                    {errors[`turns.${index}.userMessage`]}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`turn-${index}-exp`} className="text-xs">
                  Expected Behavior
                </Label>
                <Textarea
                  id={`turn-${index}-exp`}
                  variant="glass"
                  rows={2}
                  value={turn.expectedBehavior}
                  onChange={(e) =>
                    updateTurn(index, "expectedBehavior", e.target.value)
                  }
                  placeholder="What the agent should do or say at this turn"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`turn-${index}-rubric`} className="text-xs">
                  Rubric Criteria
                </Label>
                <p className="text-xs text-white/30">
                  Pipe-separated criteria evaluated after this turn&apos;s
                  response.
                </p>
                <Input
                  id={`turn-${index}-rubric`}
                  type="text"
                  variant="glass"
                  value={turn.rubric}
                  onChange={(e) =>
                    updateTurn(index, "rubric", e.target.value)
                  }
                  placeholder="Criterion 1 | Criterion 2"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

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
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [addSubmitting, setAddSubmitting] = useState(false);

  // Edit test case
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TestCaseFormData>(emptyForm);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Expand test case details
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Regenerate
  const [generating, setGenerating] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);

  // Run
  const [running, setRunning] = useState(false);
  const [activeRun, setActiveRun] = useState<AgentTestRunSummary | null>(null);
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);

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
  }, [status, configId]);

  const poll = (runId: string) => {
    const doPoll = async () => {
      try {
        const pollRes = await fetch(`/api/agent-test-runs/${runId}`);
        if (pollRes.ok) {
          const pollData = await pollRes.json();
          const updated: AgentTestRunSummary = pollData.data;
          setActiveRun(updated);
          if (updated.status === "running" || updated.status === "pending") {
            setTimeout(doPoll, 2000);
          } else {
            setRunning(false);
          }
          return;
        }
      } catch {
        // network hiccup — retry
      }
      setTimeout(doPoll, 3000);
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
      if (runsRes.ok) {
        const runsData = await runsRes.json();
        const runs: { runId: string; status: string }[] = runsData.data ?? [];
        const latest = runs[0];
        if (latest) {
          const runRes = await fetch(`/api/agent-test-runs/${latest.runId}`);
          if (runRes.ok) {
            const runData = await runRes.json();
            const run: AgentTestRunSummary = runData.data;
            setActiveRun(run);
            if (run.status === "running" || run.status === "pending") {
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

  const validateForm = (form: TestCaseFormData): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = "Title is required";
    if (!form.input.trim()) errors.input = "Opening message is required";
    if (form.category !== "multi_turn" && !form.rubric.trim())
      errors.rubric = "Rubric is required";
    if (!form.expectedBehavior.trim())
      errors.expectedBehavior = "Expected behavior is required";
    if (form.category === "multi_turn" && form.turns.length === 0)
      errors.turns = "At least one follow-up turn is required";
    form.turns.forEach((t, i) => {
      if (!t.userMessage.trim())
        errors[`turns.${i}.userMessage`] = `Turn ${i + 2} message is required`;
    });
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
          body: JSON.stringify({
            ...addForm,
            turns:
              addForm.category === "multi_turn" && addForm.turns.length > 0
                ? addForm.turns
                : null,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to create test case");
      // Normalise turns from DB (stored as JSON string, returned as string or null)
      const tc: AgentTestCase = {
        ...data.data,
        turns: parseTurns(data.data.turns),
      };
      setTestCases((prev) => [...prev, tc]);
      setAddForm(emptyForm);
      setAddErrors({});
      setShowAddForm(false);
      setAlert({
        type: "success",
        title: "Created",
        message: `Test case "${tc.title}" created.`,
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
      dimension: tc.dimension ?? null,
      title: tc.title,
      input: tc.input,
      rubric: tc.rubric,
      expectedBehavior: tc.expectedBehavior,
      turns: tc.turns ?? [],
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
        body: JSON.stringify({
          ...editForm,
          turns:
            editForm.category === "multi_turn" && editForm.turns.length > 0
              ? editForm.turns
              : null,
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to update test case");
      const updated: AgentTestCase = {
        ...data.data,
        turns: parseTurns(data.data.turns),
      };
      setTestCases((prev) =>
        prev.map((tc) => (tc.id === tcId ? updated : tc)),
      );
      setEditingId(null);
      setAlert({
        type: "success",
        title: "Updated",
        message: `Test case "${updated.title}" updated.`,
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
      const res = await fetch(
        `/api/agent-test-configs/${configId}/generate-tests`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to generate test cases");
      setTestCases(
        (data.data as AgentTestCase[]).map((tc) => ({
          ...tc,
          turns: parseTurns((tc as unknown as { turns: string | null }).turns),
        })),
      );
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

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const parseTurns = (raw: unknown): AgentTestCaseTurn[] | null => {
    if (!raw) return null;
    if (Array.isArray(raw)) return raw as AgentTestCaseTurn[];
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw) as AgentTestCaseTurn[];
      } catch {
        return null;
      }
    }
    return null;
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

  // ─── Shared form fields ───────────────────────────────────────────────────

  const renderFormFields = (
    form: TestCaseFormData,
    setForm: React.Dispatch<React.SetStateAction<TestCaseFormData>>,
    errors: Record<string, string>,
    idPrefix: string,
  ) => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-category`}>Category</Label>
          <div className="relative">
            <select
              id={`${idPrefix}-category`}
              value={form.category}
              onChange={(e) => {
                const cat = e.target.value as Category;
                setForm((f) => ({
                  ...f,
                  category: cat,
                  turns: cat === "multi_turn" ? f.turns : [],
                }));
              }}
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
        {/* Dimension */}
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-dimension`}>QA Dimension</Label>
          <div className="relative">
            <select
              id={`${idPrefix}-dimension`}
              value={form.dimension ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, dimension: e.target.value || null }))}
              className="cursor-pointer w-full appearance-none rounded-full border border-white/15 bg-[#0f0f12] px-4 py-2 pr-8 text-sm text-white/90 focus:border-primary focus:outline-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
            >
              <option value="">Not specified</option>
              {Object.entries(DIMENSION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-title`}>
            Title <span className="text-red-400">*</span>
          </Label>
          <Input
            id={`${idPrefix}-title`}
            type="text"
            variant="glass"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Short descriptive title"
          />
          {errors.title && (
            <p className="text-xs text-red-400">{errors.title}</p>
          )}
        </div>
      </div>

      {/* Input / opening message */}
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-input`}>
          {form.category === "multi_turn"
            ? "Turn 1 — Opening Message"
            : "User Input"}{" "}
          <span className="text-red-400">*</span>
        </Label>
        {form.category === "multi_turn" && (
          <p className="text-xs text-white/40">
            The first message sent to the agent to start the conversation.
          </p>
        )}
        {form.category !== "multi_turn" && (
          <p className="text-xs text-white/40">
            The exact message that will be sent to your agent.
          </p>
        )}
        <Textarea
          id={`${idPrefix}-input`}
          variant="glass"
          rows={3}
          value={form.input}
          onChange={(e) => setForm((f) => ({ ...f, input: e.target.value }))}
          placeholder={
            form.category === "multi_turn"
              ? "e.g. I need help with the Grade 3 NIE Mathematics curriculum"
              : "e.g. What is the refund policy for cancelled orders?"
          }
        />
        {errors.input && (
          <p className="text-xs text-red-400">{errors.input}</p>
        )}
      </div>

      {/* Turns editor — only for multi_turn */}
      {form.category === "multi_turn" && (
        <TurnsEditor
          turns={form.turns}
          onChange={(turns) => setForm((f) => ({ ...f, turns }))}
          errors={errors}
        />
      )}

      {/* Expected behavior */}
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-expected`}>
          Expected Behavior <span className="text-red-400">*</span>
        </Label>
        <Textarea
          id={`${idPrefix}-expected`}
          variant="glass"
          rows={3}
          value={form.expectedBehavior}
          onChange={(e) =>
            setForm((f) => ({ ...f, expectedBehavior: e.target.value }))
          }
          placeholder={
            form.category === "multi_turn"
              ? "Describe the overall goal: what the full conversation should achieve."
              : "Describe what the agent should do or say."
          }
        />
        {errors.expectedBehavior && (
          <p className="text-xs text-red-400">{errors.expectedBehavior}</p>
        )}
      </div>

      {/* Rubric — hidden for multi_turn (per-turn rubrics used instead) */}
      {form.category !== "multi_turn" && (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-rubric`}>
            Rubric Criteria <span className="text-red-400">*</span>
          </Label>
          <p className="text-xs text-white/40">
            Pipe-separated pass/fail criteria, e.g.{" "}
            <span className="font-mono text-white/50">
              Mentions refund window | Does not hallucinate | Offers next steps
            </span>
          </p>
          <Textarea
            id={`${idPrefix}-rubric`}
            variant="glass"
            rows={3}
            value={form.rubric}
            onChange={(e) =>
              setForm((f) => ({ ...f, rubric: e.target.value }))
            }
            placeholder="Criterion 1 | Criterion 2 | Criterion 3"
          />
          {errors.rubric && (
            <p className="text-xs text-red-400">{errors.rubric}</p>
          )}
        </div>
      )}
    </>
  );

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
            <div className="flex justify-end gap-3">
              <ButtonPrimary
                type="button"
                variant="ghost"
                onClick={() => setShowRegenConfirm(false)}
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
                <button
                  onClick={() =>
                    router.push(
                      `/agent-testing/configs/${configId}/results`
                    )
                  }
                  className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <FlaskConical className="w-3 h-3" />
                  Results History
                </button>

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

                {testCases.length > 0 && (
                  <button
                    onClick={handleRunTests}
                    disabled={
                      running ||
                      activeRun?.status === "running" ||
                      activeRun?.status === "pending"
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
                    ) : (
                      <>
                        <Play className="w-3 h-3" />
                        {activeRun?.status === "completed"
                          ? "Re-run"
                          : "Run Tests"}
                      </>
                    )}
                  </button>
                )}

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
              </div>
            </div>
          </div>

          {/* Run progress */}
          {activeRun && (
            <div className="mb-6">
              <DetailCard contentClassName="">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all duration-500"
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
                    </span>
                  </div>

                  {inProgressResult && (
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
                  <div className="space-y-1.5">
                    {activeRun.results.map((r) => {
                      const isDone =
                        r.status === "success" || r.status === "error";
                      const isRunning =
                        r.status === "pending" &&
                        inProgressResult?.id === r.id;
                      const isOpen =
                        expandedResultId === r.id ||
                        (isDone &&
                          expandedResultId !== `closed-${r.id}`);
                      const isMultiTurn =
                        r.testCase.category === "multi_turn";

                      let parsedRequest: { url?: string; body?: unknown } | null =
                        null;
                      try {
                        if (r.requestPayload && !isMultiTurn)
                          parsedRequest = JSON.parse(r.requestPayload);
                      } catch { /* */ }

                      let parsedResponse: unknown = null;
                      const rawResponse = r.agentResponse ?? "";
                      try {
                        if (rawResponse && !isMultiTurn)
                          parsedResponse = JSON.parse(rawResponse);
                      } catch { /* */ }

                      return (
                        <div
                          key={r.id}
                          className={`rounded-xl border overflow-hidden transition-all ${
                            r.status === "success"
                              ? "border-green-500/20 bg-green-500/3"
                              : r.status === "error"
                                ? "border-red-500/20 bg-red-500/3"
                                : isRunning
                                  ? "border-yellow-500/20 bg-yellow-500/3"
                                  : "border-white/8 bg-white/2"
                          }`}
                        >
                          {/* Header row */}
                          <button
                            onClick={() =>
                              setExpandedResultId(
                                isOpen ? `closed-${r.id}` : r.id,
                              )
                            }
                            className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/4 transition-colors"
                          >
                            <span className="shrink-0">
                              {isRunning ? (
                                <Loader2 className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
                              ) : r.status === "pending" ? (
                                <Clock className="w-3.5 h-3.5 text-white/30" />
                              ) : r.status === "success" ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-red-400" />
                              )}
                            </span>
                            <span className="flex-1 text-xs text-white/80 truncate font-medium">
                              {r.testCase.title}
                            </span>
                            <span
                              className={`shrink-0 text-xs px-1.5 py-0.5 rounded border font-medium ${CATEGORY_COLORS[r.testCase.category] ?? "bg-white/5 text-white/40 border-white/10"}`}
                            >
                              {CATEGORY_LABELS[r.testCase.category] ??
                                r.testCase.category}
                            </span>
                            {r.httpStatus != null && (
                              <span
                                className={`shrink-0 text-xs font-mono px-1.5 py-0.5 rounded border ${r.httpStatus >= 200 && r.httpStatus < 300 ? "text-green-400 bg-green-500/10 border-green-500/20" : "text-red-400 bg-red-500/10 border-red-500/20"}`}
                              >
                                {r.httpStatus}
                              </span>
                            )}
                            {r.latencyMs != null && (
                              <span className="shrink-0 text-xs text-white/30 font-mono">
                                {r.latencyMs}ms
                              </span>
                            )}
                            {isOpen ? (
                              <ChevronUp className="w-3 h-3 text-white/30 shrink-0" />
                            ) : (
                              <ChevronDown className="w-3 h-3 text-white/30 shrink-0" />
                            )}
                          </button>

                          {/* Request / Response panel */}
                          {isOpen && (
                            <div className="border-t border-white/8">
                              {isRunning ? (
                                <div className="flex items-center gap-2 px-4 py-3 text-xs text-yellow-300/70">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  Sending request...
                                </div>
                              ) : isMultiTurn ? (
                                <MultiTurnResultPanel
                                  requestPayload={r.requestPayload}
                                  agentResponse={r.agentResponse}
                                />
                              ) : (
                                <div className="grid grid-cols-2 divide-x divide-white/8">
                                  {/* Request */}
                                  <div className="p-3 space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                                        Request
                                      </span>
                                      {parsedRequest?.url && (
                                        <span className="text-xs font-mono text-white/30 truncate">
                                          POST {parsedRequest.url}
                                        </span>
                                      )}
                                    </div>
                                    {parsedRequest?.body ? (
                                      <pre className="text-xs text-white/65 bg-black/20 rounded-lg px-3 py-2 overflow-x-auto whitespace-pre-wrap max-h-48 font-mono leading-relaxed">
                                        {JSON.stringify(
                                          parsedRequest.body,
                                          null,
                                          2,
                                        )}
                                      </pre>
                                    ) : r.requestPayload ? (
                                      <pre className="text-xs text-white/65 bg-black/20 rounded-lg px-3 py-2 overflow-x-auto whitespace-pre-wrap max-h-48 font-mono leading-relaxed">
                                        {r.requestPayload}
                                      </pre>
                                    ) : (
                                      <p className="text-xs text-white/25 italic">
                                        Not sent yet
                                      </p>
                                    )}
                                  </div>

                                  {/* Response */}
                                  <div className="p-3 space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">
                                        Response
                                      </span>
                                      {r.httpStatus != null && (
                                        <span
                                          className={`text-xs font-mono font-semibold ${r.httpStatus >= 200 && r.httpStatus < 300 ? "text-green-400" : "text-red-400"}`}
                                        >
                                          {r.httpStatus}
                                        </span>
                                      )}
                                      {r.latencyMs != null && (
                                        <span className="text-xs text-white/30 font-mono ml-auto">
                                          {r.latencyMs}ms
                                        </span>
                                      )}
                                    </div>
                                    {parsedResponse ? (
                                      <pre className="text-xs text-white/65 bg-black/20 rounded-lg px-3 py-2 overflow-x-auto whitespace-pre-wrap max-h-48 font-mono leading-relaxed">
                                        {JSON.stringify(parsedResponse, null, 2)}
                                      </pre>
                                    ) : rawResponse ? (
                                      <pre className="text-xs text-white/65 bg-black/20 rounded-lg px-3 py-2 overflow-x-auto whitespace-pre-wrap max-h-48 font-mono leading-relaxed">
                                        {rawResponse}
                                      </pre>
                                    ) : r.errorMessage ? (
                                      <div className="text-xs text-red-300 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
                                        {r.errorMessage}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-white/25 italic">
                                        Waiting for response...
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                  {renderFormFields(addForm, setAddForm, addErrors, "add")}
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
                const isMultiTurn = tc.category === "multi_turn";
                const parsedTurns = parseTurns(tc.turns) ?? [];

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

                        {renderFormFields(
                          editForm,
                          setEditForm,
                          editErrors,
                          `edit-${tc.id}`,
                        )}

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
                      {tc.dimension && (
                        <span
                          className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${DIMENSION_COLORS[tc.dimension] ?? "bg-white/5 text-white/40 border-white/10"}`}
                        >
                          {DIMENSION_LABELS[tc.dimension] ?? tc.dimension}
                        </span>
                      )}
                      <span className="flex-1 text-sm text-white/85 truncate font-medium">
                        {tc.title}
                      </span>
                      {isMultiTurn && parsedTurns.length > 0 && (
                        <span className="shrink-0 text-xs text-purple-400/60 font-mono">
                          {parsedTurns.length + 1} turns
                        </span>
                      )}
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
                        {/* Conversation flow (multi_turn) or single input */}
                        {isMultiTurn ? (
                          <div>
                            <p className="text-xs font-medium text-purple-400/70 uppercase tracking-wider mb-2">
                              Conversation Flow
                            </p>
                            <div className="space-y-2">
                              <div className="rounded-lg bg-white/5 px-3 py-2 space-y-1">
                                <p className="text-xs text-blue-400/70 font-medium">
                                  Turn 1 — Opening
                                </p>
                                <p className="text-sm text-white/75">
                                  {tc.input}
                                </p>
                              </div>
                              {parsedTurns.map((turn) => (
                                <div
                                  key={turn.turnNumber}
                                  className="rounded-lg bg-white/5 px-3 py-2 space-y-1"
                                >
                                  <p className="text-xs text-blue-400/70 font-medium">
                                    Turn {turn.turnNumber}
                                  </p>
                                  <p className="text-sm text-white/75">
                                    {turn.userMessage}
                                  </p>
                                  {turn.rubric && (
                                    <p className="text-xs text-purple-300/50 mt-1">
                                      Rubric: {turn.rubric}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs font-medium text-blue-400/70 uppercase tracking-wider mb-1.5">
                              User Input
                            </p>
                            <p className="text-sm text-white/75 bg-white/5 rounded-lg px-3 py-2">
                              {tc.input}
                            </p>
                          </div>
                        )}

                        {/* Expected behavior */}
                        <div>
                          <p className="text-xs font-medium text-green-400/70 uppercase tracking-wider mb-1.5">
                            Expected Behavior
                          </p>
                          <p className="text-sm text-white/75 bg-white/5 rounded-lg px-3 py-2">
                            {tc.expectedBehavior}
                          </p>
                        </div>

                        {/* Rubric (single-turn only) */}
                        {!isMultiTurn && rubricItems.length > 0 && (
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
                        )}
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
