import * as React from "react"
import { Badge } from "@/components/ui/badge"

export type Priority = "low" | "medium" | "high" | "critical"

const styles: Record<Priority, string> = {
  low: "bg-white/8 text-white/70 border border-white/15",
  medium: "bg-blue-500/25 text-blue-300 border border-blue-400/30",
  high: "bg-orange-500/30 text-orange-200 border border-orange-400/40",
  critical: "bg-red-600/35 text-red-200 border border-red-500/50",
}

export interface PriorityBadgeProps extends Omit<React.ComponentProps<typeof Badge>, "variant"> {
  priority: Priority
}

export function PriorityBadge({ priority, className, children, ...props }: PriorityBadgeProps) {
  return (
    <Badge
      variant="glass"
      className={[
        "rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-md",
        styles[priority],
        className,
      ].join(" ")}
      {...props}
    >
      {children ?? priority}
    </Badge>
  )
}

export default PriorityBadge
