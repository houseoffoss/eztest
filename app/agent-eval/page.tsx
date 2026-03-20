'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface RunSummary {
  runId: string
  agentName: string
  inputType: string
  traceStrategy: string | null
  status: string
  compositeScore: number | null
  verdict: string | null
  testCount: number
  startedAt: string
  completedAt: string | null
}

const STATUS_STYLE: Record<string, string> = {
  running: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  review_pending: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  failed: 'text-red-400 bg-red-500/10 border-red-500/20',
  aborted: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
}

const VERDICT_COLOR: Record<string, string> = {
  excellent: 'text-emerald-400',
  good: 'text-blue-400',
  needs_improvement: 'text-yellow-400',
  poor: 'text-red-400',
}

export default function AgentEvalDashboard() {
  const router = useRouter()
  const [runs, setRuns] = useState<RunSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/eval/runs/list')
      .then(r => r.json())
      .then((data: RunSummary[]) => { setRuns(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const completedRuns = runs.filter(r => r.status === 'completed' && r.compositeScore != null)
  const avgScore = completedRuns.length > 0
    ? completedRuns.reduce((s, r) => s + (r.compositeScore ?? 0), 0) / completedRuns.length
    : null

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Agent Eval</h1>
          <p className="text-sm text-muted-foreground mt-1">Autonomous AI agent testing framework</p>
        </div>
        <button
          onClick={() => router.push('/agent-eval/runs/new')}
          className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all"
        >
          + New Run
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Runs', value: runs.length },
          { label: 'Completed', value: completedRuns.length },
          { label: 'Pending Review', value: runs.filter(r => r.status === 'review_pending').length },
          {
            label: 'Avg Score',
            value: avgScore != null ? avgScore.toFixed(1) : '—',
            color: avgScore != null ? (avgScore >= 7 ? 'text-emerald-400' : avgScore >= 5 ? 'text-yellow-400' : 'text-red-400') : 'text-foreground',
          },
        ].map(stat => (
          <div key={stat.label} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-5 text-center">
            <p className={`text-3xl font-bold ${stat.color ?? 'text-foreground'}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Runs list */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 rounded-xl" />)}
        </div>
      ) : runs.length === 0 ? (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-16 text-center">
          <p className="text-foreground font-medium mb-1">No runs yet</p>
          <p className="text-sm text-muted-foreground mb-5">Start an evaluation to test your first agent.</p>
          <button
            onClick={() => router.push('/agent-eval/runs/new')}
            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
          >
            Start First Run
          </button>
        </div>
      ) : (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5">
            <p className="text-sm font-medium text-foreground">All Runs</p>
          </div>
          <div className="divide-y divide-white/5">
            {runs.map(run => (
              <button
                key={run.runId}
                onClick={() => router.push(`/agent-eval/runs/${run.runId}`)}
                className="w-full px-5 py-4 flex items-center gap-4 hover:bg-white/5 transition-all text-left"
              >
                {/* Agent name + input type */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{run.agentName}</span>
                    <span className="text-xs text-muted-foreground/60 flex-shrink-0">
                      {run.inputType === 'git_repo' ? '🔗 repo' : '⚡ api'}
                    </span>
                    {run.traceStrategy === 'langfuse' && (
                      <span className="text-xs text-muted-foreground/60 flex-shrink-0">· 🔍 langfuse</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(run.startedAt).toLocaleString()} · {run.testCount} tests
                  </p>
                </div>

                {/* Score */}
                {run.compositeScore != null ? (
                  <div className="text-right flex-shrink-0">
                    <p className={`text-lg font-semibold ${VERDICT_COLOR[run.verdict ?? ''] ?? 'text-foreground'}`}>
                      {run.compositeScore.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{run.verdict?.replace('_', ' ')}</p>
                  </div>
                ) : (
                  <div className="w-12" />
                )}

                {/* Status */}
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex-shrink-0 ${STATUS_STYLE[run.status] ?? ''}`}>
                  {run.status.replace('_', ' ')}
                </span>

                {/* CTA for review_pending */}
                {run.status === 'review_pending' && (
                  <span className="text-xs text-yellow-400 flex-shrink-0">Review →</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
