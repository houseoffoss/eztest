import * as React from "react"
import { Badge } from "@/components/ui/badge"

export type TestStatus = "passed" | "failed" | "skipped" | "running" | "blocked" | "queued"

export interface StatusBadgeProps extends Omit<React.ComponentProps<typeof Badge>, "variant"> {
  status: TestStatus
  pulse?: boolean
}

const styles: Record<TestStatus, string> = {
  passed: "bg-emerald-500/25 text-emerald-300 border border-emerald-400/30",
  failed: "bg-red-600/25 text-red-300 border border-red-500/30",
  skipped: "bg-white/10 text-white/70 border border-white/15",
  running: "bg-blue-500/25 text-blue-300 border border-blue-500/30",
  blocked: "bg-orange-500/25 text-orange-300 border border-orange-500/30",
  queued: "bg-purple-500/25 text-purple-300 border border-purple-500/30",
}

export function StatusBadge({ status, pulse = false, className, children, ...props }: StatusBadgeProps) {
  return (
    <Badge
      variant="glass"
      className={[
        "rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-md",
        styles[status],
        pulse ? "animate-pulse" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children ?? status}
    </Badge>
  )
}

export default StatusBadge
