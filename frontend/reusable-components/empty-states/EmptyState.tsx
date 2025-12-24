"use client"

import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "../../reusable-elements/buttons/Button"
import { Card, CardContent } from "../../reusable-elements/cards/Card"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  variant?: "default" | "glass" | "inline"
  className?: string
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = "default",
  className,
}: EmptyStateProps) {
  const content = (
    <div className={cn("text-center", variant === "inline" ? "py-8" : "py-12")}>
      {Icon && (
        <div
          className={cn(
            "mx-auto mb-4",
            variant === "inline"
              ? "flex items-center justify-center"
              : "rounded-full bg-white/5 p-6 w-fit"
          )}
        >
          <Icon className={cn("text-gray-400", variant === "inline" ? "w-8 h-8" : "w-12 h-12")} />
        </div>
      )}
      <h3
        className={cn(
          "font-semibold text-white mb-2",
          variant === "inline" ? "text-base" : "text-xl"
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            "text-gray-400 mb-6",
            variant === "inline" ? "text-sm mb-4" : "max-w-md mx-auto"
          )}
        >
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="default" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )

  if (variant === "inline") {
    return <div className={className}>{content}</div>
  }

  return (
    <Card variant={variant === "glass" ? "glass" : "default"} className={className}>
      <CardContent>{content}</CardContent>
    </Card>
  )
}

export { EmptyState }
export type { EmptyStateProps }

