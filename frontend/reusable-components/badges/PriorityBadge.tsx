import * as React from "react"
import { Badge } from "@/frontend/reusable-elements/badges/Badge"

export type Priority = "low" | "medium" | "high" | "critical"

const styles: Record<Priority, string> = {
  low: "bg-white/8 text-white/70 border border-white/15",
  medium: "bg-blue-500/25 text-blue-300 border border-blue-400/30",
  high: "bg-orange-500/30 text-orange-200 border border-orange-400/40",
  critical: "bg-red-600/35 text-red-200 border border-red-500/50",
}

export interface PriorityBadgeProps extends Omit<React.ComponentProps<typeof Badge>, "variant"> {
  priority: Priority | string
  dynamicClassName?: string
  dynamicStyle?: React.CSSProperties
}

export function PriorityBadge({ 
  priority, 
  className, 
  children, 
  dynamicClassName,
  dynamicStyle,
  ...props 
}: PriorityBadgeProps) {
  // Use dynamic styles if provided, otherwise fall back to default styles
  const badgeClassName = dynamicClassName 
    ? dynamicClassName
    : styles[priority as Priority] || styles.medium;

  // Use "outline" variant when dynamic styles are provided to match other badges
  // Otherwise use "glass" variant for default styling
  const variant = dynamicClassName ? "outline" : "glass";

  return (
    <Badge
      variant={variant}
      className={[
        dynamicClassName ? "px-2 py-0.5" : "px-2.5 py-0.5", // Match defect table padding when using dynamic styles
        "text-xs",
        dynamicClassName ? "" : "font-semibold", // Only apply font-semibold when using default styles
        badgeClassName,
        className,
      ].join(" ")}
      style={dynamicStyle}
      {...props}
    >
      {children ?? (typeof priority === 'string' ? priority.toUpperCase() : priority)}
    </Badge>
  )
}

export default PriorityBadge

