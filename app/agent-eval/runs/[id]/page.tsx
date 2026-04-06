'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'

interface TestResult {
  id: string
  title: string
  category: string
  verdict: string | null
  compositeScore: number | null
  factualAccuracy: number | null
  instructionFollowing: number | null
  latencyMs: number | null
}

interface RunData {
  runId: string
  status: string
  compositeScore: number | null
  verdict: string | null
  startedAt: string
  completedAt: string | null
  testCounts: {
    total: number
    pendingReview: number
    approved: number
    executed: number
  }
  results: TestResult[]
  report: {
    runScore: number
    markdownPath: string | null
    generatedAt: string
  } | null
}

const VERDICT_STYLE: Record<string, string> = {
  PASS: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  FAIL: 'text-red-400 bg-red-500/10 border-red-500/20',
  ERROR: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  CRITICAL_FAIL: 'text-red-500 bg-red-500/15 border-red-500/30',
  BLOCKED: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
}

const CATEGORY_COLORS: Record<string, string> = {
  happy_path: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  edge_case: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  adversarial: 'bg-red-500/10 text-red-400 border-red-500/20',
  tool_use: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  multi_turn: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

const SCORE_BAND: Record<string, string> = {
  excellent: 'text-emerald-400',
  good: 'text-blue-400',
  needs_improvement: 'text-yellow-400',
  poor: 'text-red-400',
}

export default function RunStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: runId } = use(params)
  const router = useRouter()
  const [run, setRun] = useState<RunData | null>(null)
  const [loading, setLoading] = useState(true)

  function fetchRun() {
    fetch(`/api/eval/runs/${runId}`)
      .then(r => r.json())
      .then((data: RunData) => {
        setRun(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchRun()
    // Poll every 5s while running
    const interval = setInterval(() => {
      if (run?.status === 'running') fetchRun()
    }, 5000)
    return () => clearInterval(interval)
  }, [runId, run?.status])

  if (loading) return <PageShell runId={runId}><LoadingState /></PageShell>
  if (!run) return <PageShell runId={runId}><p className="text-muted-foreground text-sm text-center py-16">Run not found.</p></PageShell>

  const passCount = run.results.filter(r => r.verdict === 'PASS').length
  const failCount = run.results.filter(r => r.verdict === 'FAIL').length
  const errorCount = run.results.filter(r => r.verdict === 'ERROR').length

  return (
    <PageShell runId={runId}>
      {/* Status banner */}
      <StatusBanner run={run} onGoToReview={() => router.push(`/agent-eval/runs/${runId}/review`)} />

      {/* Score summary — only when completed */}
      {run.status === 'completed' && run.compositeScore != null && (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 mb-5 flex items-center gap-8">
          <div className="text-center">
            <p className={`text-5xl font-bold ${SCORE_BAND[run.verdict ?? ''] ?? 'text-foreground'}`}>
              {run.compositeScore.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">out of 10</p>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-semibold text-emerald-400">{passCount}</p>
              <p className="text-xs text-muted-foreground">Passed</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-red-400">{failCount}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-yellow-400">{errorCount}</p>
              <p className="text-xs text-muted-foreground">Errors</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-sm font-semibold uppercase tracking-wide ${SCORE_BAND[run.verdict ?? ''] ?? ''}`}>
              {run.verdict?.replace('_', ' ')}
            </span>
            {run.report?.markdownPath && (
              <p className="text-xs text-muted-foreground mt-1">
                Report saved to <code className="text-primary/80">{run.report.markdownPath.split('/').slice(-1)}</code>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Test counts */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Tests', value: run.testCounts.total },
          { label: 'Pending Review', value: run.testCounts.pendingReview },
          { label: 'Approved', value: run.testCounts.approved },
          { label: 'Executed', value: run.testCounts.executed },
        ].map(stat => (
          <div key={stat.label} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-xl font-semibold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Results table */}
      {run.results.length > 0 && (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Test Results</p>
            <p className="text-xs text-muted-foreground">{run.results.length} executed</p>
          </div>
          <div className="divide-y divide-white/5">
            {run.results.map(result => (
              <div key={result.id} className="px-5 py-3.5 flex items-center gap-4">
                {/* Verdict badge */}
                <span className={`text-xs px-2 py-0.5 rounded border font-medium flex-shrink-0 ${VERDICT_STYLE[result.verdict ?? ''] ?? 'text-muted-foreground'}`}>
                  {result.verdict ?? '—'}
                </span>

                {/* Category */}
                <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${CATEGORY_COLORS[result.category] ?? 'bg-white/10 text-foreground border-white/10'}`}>
                  {result.category.replace('_', ' ')}
                </span>

                {/* Title */}
                <span className="text-sm text-foreground flex-1 min-w-0 truncate">{result.title}</span>

                {/* Scores */}
                <div className="flex items-center gap-4 flex-shrink-0 text-xs text-muted-foreground">
                  {result.compositeScore != null && (
                    <span className="font-medium text-foreground">{result.compositeScore.toFixed(1)}</span>
                  )}
                  {result.factualAccuracy != null && (
                    <span title="Factual Accuracy">FA: {result.factualAccuracy.toFixed(1)}</span>
                  )}
                  {result.instructionFollowing != null && (
                    <span title="Instruction Following">IF: {result.instructionFollowing.toFixed(1)}</span>
                  )}
                  {result.latencyMs != null && (
                    <span>{result.latencyMs}ms</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state while running */}
      {run.results.length === 0 && run.status === 'running' && (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-10 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span className="animate-spin">⟳</span>
            <span className="text-sm">Tests are executing...</span>
          </div>
          <button onClick={fetchRun} className="mt-3 text-xs text-primary hover:underline">Refresh</button>
        </div>
      )}
    </PageShell>
  )
}

function StatusBanner({ run, onGoToReview }: { run: RunData; onGoToReview: () => void }) {
  const statusConfig: Record<string, { label: string; color: string; desc: string }> = {
    running: { label: 'Running', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', desc: 'Tests are executing...' },
    review_pending: { label: 'Pending Review', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', desc: 'Generated tests are waiting for your approval.' },
    completed: { label: 'Completed', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', desc: 'Evaluation finished.' },
    failed: { label: 'Failed', color: 'text-red-400 bg-red-500/10 border-red-500/20', desc: 'Run encountered an error.' },
    aborted: { label: 'Aborted', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20', desc: 'Run was aborted.' },
  }

  const cfg = statusConfig[run.status] ?? statusConfig['running']

  return (
    <div className={`backdrop-blur-xl border rounded-xl px-5 py-4 mb-5 flex items-center justify-between ${cfg.color}`}>
      <div className="flex items-center gap-3">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.color}`}>{cfg.label}</span>
        <span className="text-sm text-muted-foreground">{cfg.desc}</span>
        <span className="text-xs text-muted-foreground/60 font-mono">{run.runId}</span>
      </div>
      {run.status === 'review_pending' && (
        <button
          onClick={onGoToReview}
          className="px-4 py-1.5 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-sm font-medium hover:bg-yellow-500/30 transition-all"
        >
          Review Tests →
        </button>
      )}
    </div>
  )
}

function PageShell({ runId, children }: { runId: string; children: React.ReactNode }) {
  const router = useRouter()
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <button onClick={() => router.push('/agent-eval')} className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1 transition-colors">
        ← All Runs
      </button>
      <h1 className="text-2xl font-semibold text-foreground mb-6">Run Details</h1>
      {children}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-14 bg-white/5 rounded-xl" />
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white/5 rounded-xl" />)}
      </div>
      <div className="h-64 bg-white/5 rounded-xl" />
    </div>
  )
}
