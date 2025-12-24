import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/frontend/reusable-elements/cards/Card"

export interface EmptyStateSimpleProps extends Omit<React.ComponentProps<typeof Card>, "title"> {
  icon?: React.ReactNode
  heading: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
}

/**
 * Simple empty state component without heavy styling
 * Used for inline empty states within cards
 */
export function EmptyStateSimple({ icon, heading, description, actions, className, ...props }: EmptyStateSimpleProps) {
  return (
    <Card variant="glass" className={cn("items-center text-center", className)} {...props}>
      <CardContent className="py-10 space-y-3">
        {icon ? <div className="text-4xl">{icon}</div> : null}
        <h3 className="text-white text-lg font-semibold">{heading}</h3>
        {description ? <p className="text-white/70 text-sm max-w-md mx-auto">{description}</p> : null}
        {actions ? <div className="pt-2">{actions}</div> : null}
      </CardContent>
    </Card>
  )
}

export default EmptyStateSimple

