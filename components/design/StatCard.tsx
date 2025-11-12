import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export interface StatCardProps extends React.ComponentProps<typeof Card> {
  label: React.ReactNode
  value: React.ReactNode
  helpText?: React.ReactNode
  trend?: "up" | "down" | "neutral"
  delta?: React.ReactNode
  icon?: React.ReactNode
}

export function StatCard({
  label,
  value,
  helpText,
  trend = "neutral",
  delta,
  icon,
  className,
  ...props
}: StatCardProps) {
  const deltaColor =
    trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-white/60"

  return (
    <Card variant="glass" className={cn(className)} {...props}>
      <CardHeader className="flex-row items-center justify-between">
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
  )}

export default StatCard
