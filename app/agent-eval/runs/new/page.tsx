'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type InputType = 'git_repo' | 'api'
type TraceStrategy = 'langfuse' | 'blackbox'

export default function NewRunPage() {
  const router = useRouter()
  const [inputType, setInputType] = useState<InputType>('git_repo')
  const [traceStrategy, setTraceStrategy] = useState<TraceStrategy>('blackbox')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Git repo fields
  const [repoUrl, setRepoUrl] = useState('')
  const [repoBranch, setRepoBranch] = useState('')

  // API fields
  const [endpoint, setEndpoint] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')

  // Langfuse fields
  const [langfusePublicKey, setLangfusePublicKey] = useState('')
  const [langfuseSecretKey, setLangfuseSecretKey] = useState('')
  const [langfuseHost, setLangfuseHost] = useState('https://cloud.langfuse.com')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const payload =
      inputType === 'git_repo'
        ? {
            type: 'git_repo' as const,
            repoUrl,
            repoBranch: repoBranch || undefined,
            endpoint,
            traceStrategy,
            langfuseConfig:
              traceStrategy === 'langfuse'
                ? { publicKey: langfusePublicKey, secretKey: langfuseSecretKey, host: langfuseHost }
                : undefined,
          }
        : {
            type: 'api' as const,
            endpoint,
            systemPrompt: systemPrompt || undefined,
            agentType: 'rest' as const,
            traceStrategy,
            langfuseConfig:
              traceStrategy === 'langfuse'
                ? { publicKey: langfusePublicKey, secretKey: langfuseSecretKey, host: langfuseHost }
                : undefined,
          }

    try {
      const res = await fetch('/api/eval/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json() as { runId?: string; error?: string; status?: string }

      if (!res.ok) {
        setError(data.error ?? 'Failed to start run')
        return
      }

      router.push(`/agent-eval/runs/${data.runId}`)
    } catch {
      setError('Network error — is the server running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/agent-eval')}
          className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 transition-colors"
        >
          ← All Runs
        </button>
        <h1 className="text-2xl font-semibold text-foreground">New Evaluation Run</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Provide a Git repo or REST endpoint — the agent will generate and run tests automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Input type selector */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <p className="text-sm font-medium text-foreground">Target Agent Input</p>
          <div className="grid grid-cols-2 gap-3">
            {(['git_repo', 'api'] as InputType[]).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setInputType(type)}
                className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                  inputType === type
                    ? 'bg-primary/20 border-primary/60 text-primary'
                    : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                }`}
              >
                {type === 'git_repo' ? '🔗  Git Repository' : '⚡  REST Endpoint'}
              </button>
            ))}
          </div>

          {inputType === 'git_repo' ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Repository URL *</label>
                <input
                  required
                  value={repoUrl}
                  onChange={e => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/org/your-agent"
                  className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Branch (optional)</label>
                <input
                  value={repoBranch}
                  onChange={e => setRepoBranch(e.target.value)}
                  placeholder="main"
                  className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Agent Endpoint URL *
                  <span className="ml-2 text-muted-foreground/50 font-normal">— where the running agent accepts requests</span>
                </label>
                <input
                  required
                  value={endpoint}
                  onChange={e => setEndpoint(e.target.value)}
                  placeholder="https://your-running-agent.example.com/chat"
                  className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
                />
                <p className="text-xs text-muted-foreground/50 mt-1">
                  The repo is used to understand the agent and generate tests. This URL is where those tests are sent.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Endpoint URL *</label>
                <input
                  required
                  value={endpoint}
                  onChange={e => setEndpoint(e.target.value)}
                  placeholder="https://your-agent.example.com/chat"
                  className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">System Prompt (optional)</label>
                <textarea
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  placeholder="You are a customer support agent..."
                  rows={3}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Trace strategy */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <p className="text-sm font-medium text-foreground">Trace Visibility</p>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: 'langfuse', label: '🔍  Langfuse', desc: 'Full trace — tool calls, latency per step' },
              { value: 'blackbox', label: '⬛  Black-box', desc: 'Input/output only — no trace access' },
            ] as { value: TraceStrategy; label: string; desc: string }[]).map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTraceStrategy(opt.value)}
                className={`py-3 px-4 rounded-lg border text-left transition-all ${
                  traceStrategy === opt.value
                    ? 'bg-primary/20 border-primary/60'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <p className={`text-sm font-medium ${traceStrategy === opt.value ? 'text-primary' : 'text-foreground'}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>

          {traceStrategy === 'langfuse' && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Langfuse Public Key *</label>
                <input
                  required
                  value={langfusePublicKey}
                  onChange={e => setLangfusePublicKey(e.target.value)}
                  placeholder="pk-lf-..."
                  className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Langfuse Secret Key *</label>
                <input
                  required
                  type="password"
                  value={langfuseSecretKey}
                  onChange={e => setLangfuseSecretKey(e.target.value)}
                  placeholder="sk-lf-..."
                  className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Langfuse Host</label>
                <input
                  value={langfuseHost}
                  onChange={e => setLangfuseHost(e.target.value)}
                  placeholder="https://cloud.langfuse.com"
                  className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
                />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Starting run...' : 'Start Evaluation'}
        </button>
      </form>
    </div>
  )
}
