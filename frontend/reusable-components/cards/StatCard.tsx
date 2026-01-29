import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/reusable-elements/cards/Card"

export interface StatCardProps extends React.ComponentProps<typeof Card> {
  label: React.ReactNode
  value: React.ReactNode
  helpText?: React.ReactNode
  trend?: "up" | "down" | "neutral"
  delta?: React.ReactNode
  icon?: React.ReactNode
  borderColor?: string
}

/**
 * Reusable StatCard component for displaying statistics with optional trends
 * Used in: ProjectDetail, TestRunDetail, Dashboard, and other stats pages
 * 
 * @example
 * ```tsx
 * <StatCard 
 *   icon={<Icon />}
 *   label="Test Cases"
 *   value={42}
 *   borderColor="border-l-primary/30"
 * />
 * ```
 */
export function StatCard({
  label,
  value,
  helpText,
  trend = "neutral",
  delta,
  icon,
  borderColor,
  className,
  ...props
}: StatCardProps) {
  const deltaColor =
    trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-white/60"
  
  const gradientStyle = 'conic-gradient(from 45deg, rgba(255, 255, 255, 0.1) 0deg, rgba(255, 255, 255, 0.4) 90deg, rgba(255, 255, 255, 0.1) 180deg, rgba(255, 255, 255, 0.4) 270deg, rgba(255, 255, 255, 0.1) 360deg)';

  return (
    <div
      className={cn("rounded-3xl relative transition-all p-[1px]", className)}
      style={{ background: gradientStyle }}
      {...props}
    >
      <div className="relative rounded-3xl h-full" style={{ backgroundColor: '#0a1628' }}>
        <Card 
          variant="glass" 
          className={cn(
            "!border-0 !rounded-3xl !bg-transparent before:!bg-none !overflow-visible transition-all flex flex-col h-full",
            borderColor ? `border-l-4 ${borderColor}` : ""
          )}
        >
      <CardHeader className="flex-row items-center justify-between pb-3">
        <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
          {icon ? <span className="text-white/80">{icon}</span> : null}
          <span>{label}</span>
        </CardTitle>
        {delta ? <span className={cn("text-sm font-medium", deltaColor)}>{delta}</span> : null}
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-3xl font-bold text-white">{value}</div>
        {helpText ? (
          <CardDescription className="text-xs text-white/60">{helpText}</CardDescription>
        ) : null}
      </CardContent>
        </Card>
      </div>
    </div>
  )}

export default StatCard

