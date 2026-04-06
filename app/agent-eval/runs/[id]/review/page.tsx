'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'

interface TestCase {
  id: string
  category: string
  title: string
  rationale: string
  input: string | Array<{ role: string; content: string }>
  expectedOutput: string
  invariants: string[] | null
}

interface RunData {
  runId: string
  status: string
  pendingReviewTests: TestCase[]
  testCounts: { total: number; pendingReview: number }
}

const CATEGORY_COLORS: Record<string, string> = {
  happy_path: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  edge_case: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  adversarial: 'bg-red-500/10 text-red-400 border-red-500/20',
  tool_use: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  multi_turn: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: runId } = use(params)
  const router = useRouter()

  const [run, setRun] = useState<RunData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  const [feedback, setFeedback] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showRejectPanel, setShowRejectPanel] = useState(false)

  useEffect(() => {
    fetch(`/api/eval/runs/${runId}`)
      .then(r => r.json())
      .then((data: RunData) => {
        setRun(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load run data')
        setLoading(false)
      })
  }, [runId])

  function toggleDelete(id: string) {
    setDeletedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function submitDecision(decision: 'approve_all' | 'reject') {
    setError(null)
    setSubmitting(true)

    const body: Record<string, unknown> = { decision }
    if (decision === 'reject') body.feedback = feedback
    if (deletedIds.size > 0) body.deletedTestIds = [...deletedIds]

    try {
      const res = await fetch(`/api/eval/reviews/${runId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Failed to submit decision')
        return
      }
      router.push(`/agent-eval/runs/${runId}`)
    } catch {
      setError('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const visibleTests = run?.pendingReviewTests.filter(t => !deletedIds.has(t.id)) ?? []
  const removedCount = deletedIds.size

  if (loading) return <PageShell><LoadingState /></PageShell>
  if (error && !run) return <PageShell><ErrorState message={error} /></PageShell>
  if (!run) return null

  if (run.status !== 'review_pending') {
    return (
      <PageShell>
        <div className="text-center py-16">
          <p className="text-muted-foreground">This run is not pending review (status: {run.status})</p>
          <button onClick={() => router.push(`/agent-eval/runs/${runId}`)} className="mt-4 text-primary text-sm hover:underline">
            View run status →
          </button>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => router.push(`/agent-eval/runs/${runId}`)} className="text-sm text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1 transition-colors">
          ← Run Status
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Review Generated Tests</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {run.pendingReviewTests.length} tests generated — review before execution begins.
            </p>
          </div>
          <span className="text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-2.5 py-1 rounded-full">
            Pending Review
          </span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Generated', value: run.pendingReviewTests.length },
          { label: 'Marked for Removal', value: removedCount, highlight: removedCount > 0 },
          { label: 'Will Execute', value: visibleTests.length },
        ].map(stat => (
          <div key={stat.label} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className={`text-2xl font-semibold ${stat.highlight ? 'text-red-400' : 'text-foreground'}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Test list */}
      <div className="space-y-3 mb-6">
        {run.pendingReviewTests.map(test => {
          const isDeleted = deletedIds.has(test.id)
          const isExpanded = expandedId === test.id
          const inputText = typeof test.input === 'string'
            ? test.input
            : test.input.map(t => `${t.role}: ${t.content}`).join('\n')

          return (
            <div
              key={test.id}
              className={`backdrop-blur-xl border rounded-xl transition-all ${
                isDeleted
                  ? 'bg-red-500/5 border-red-500/20 opacity-60'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {/* Test header */}
              <div className="flex items-start gap-3 p-4">
                <button
                  type="button"
                  onClick={() => toggleDelete(test.id)}
                  className={`mt-0.5 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                    isDeleted
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'border-white/20 hover:border-red-400/60'
                  }`}
                  title={isDeleted ? 'Restore test' : 'Remove this test'}
                >
                  {isDeleted && <span className="text-xs">✕</span>}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CATEGORY_COLORS[test.category] ?? 'bg-white/10 text-foreground border-white/10'}`}>
                      {test.category.replace('_', ' ')}
                    </span>
                    <span className={`text-sm font-medium ${isDeleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {test.title}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{test.rationale}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : test.id)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                >
                  {isExpanded ? 'Less ↑' : 'Details ↓'}
                </button>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Input</p>
                    <pre className="text-xs text-foreground bg-black/20 rounded-lg p-3 whitespace-pre-wrap break-words">{inputText}</pre>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Expected Output</p>
                    <p className="text-xs text-foreground bg-black/20 rounded-lg p-3">{test.expectedOutput}</p>
                  </div>
                  {test.invariants && test.invariants.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-red-400 mb-1">Invariants (must never happen)</p>
                      <ul className="space-y-1">
                        {test.invariants.map((inv, i) => (
                          <li key={i} className="text-xs text-red-300 bg-red-500/5 rounded px-2 py-1">• {inv}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Reject panel */}
      {showRejectPanel && (
        <div className="backdrop-blur-xl bg-white/5 border border-red-500/20 rounded-xl p-5 mb-4 space-y-3">
          <p className="text-sm font-medium text-red-400">Reject with feedback</p>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Tell the agent what to change: e.g. 'Add more edge cases around empty input...'"
            rows={3}
            className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-red-400/40 resize-none"
          />
          <div className="flex gap-2">
            <button onClick={() => submitDecision('reject')} disabled={submitting || !feedback.trim()}
              className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/30 disabled:opacity-50 transition-all">
              {submitting ? 'Rejecting...' : 'Submit Rejection'}
            </button>
            <button onClick={() => setShowRejectPanel(false)}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-muted-foreground text-sm hover:bg-white/10 transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* Action bar */}
      <div className="flex gap-3">
        <button
          onClick={() => submitDecision('approve_all')}
          disabled={submitting || visibleTests.length === 0}
          className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {submitting ? 'Processing...' : `Approve & Run ${visibleTests.length} Test${visibleTests.length !== 1 ? 's' : ''}`}
        </button>
        <button
          onClick={() => setShowRejectPanel(v => !v)}
          disabled={submitting}
          className="px-5 py-3 rounded-lg bg-white/5 border border-white/10 text-muted-foreground text-sm font-medium hover:bg-white/10 disabled:opacity-50 transition-all"
        >
          Reject
        </button>
      </div>
    </PageShell>
  )
}

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="max-w-3xl mx-auto px-6 py-10">{children}</div>
}

function LoadingState() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-white/5 rounded-lg w-1/2" />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 rounded-xl" />)}
      </div>
      {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl" />)}
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="text-center py-16">
      <p className="text-red-400 text-sm">{message}</p>
    </div>
  )
}
