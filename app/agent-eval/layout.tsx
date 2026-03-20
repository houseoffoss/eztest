import type { ReactNode } from 'react'

export default function AgentEvalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a1628]">
      {children}
    </div>
  )
}
