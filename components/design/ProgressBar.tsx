import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number // 0 - 100
  showLabel?: boolean
  size?: "sm" | "md"
}

export function ProgressBar({ value, showLabel = false, size = "md", className, ...props }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={cn("w-full", className)} {...props}>
      <div className={cn("relative rounded-full border border-white/15 bg-white/5 backdrop-blur-sm", size === "sm" ? "h-2" : "h-3")}> 
        <div
          className={cn(
            // Increased transparency: lighter gradient stops
            "h-full rounded-full relative overflow-hidden bg-gradient-to-r from-primary/55 via-primary/25 to-accent/55",
            // Subtle inset edge still present
            "ring-1 ring-inset ring-white/15",
            // Sheen slightly reduced further for clarity
            "before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/20 before:to-transparent before:opacity-45"
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel ? (
        <div className="mt-1 text-right text-xs text-white/70">{clamped}%</div>
      ) : null}
    </div>
  )
}

export default ProgressBar
