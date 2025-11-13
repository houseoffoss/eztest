import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

export interface GlassPanelProps extends Omit<React.ComponentProps<typeof Card>, "title"> {
  heading?: React.ReactNode
  subheading?: React.ReactNode
  action?: React.ReactNode
  footer?: React.ReactNode
  contentClassName?: string
}

// A thin, opinionated wrapper around Card with variant="glass"
export function GlassPanel({
  heading,
  subheading,
  action,
  footer,
  className,
  contentClassName,
  children,
  ...props
}: GlassPanelProps) {
  return (
    <Card variant="glass" className={cn(className)} {...props}>
      {(heading || subheading || action) && (
        <CardHeader className={cn(action && "has-[data-slot=card-action]:grid-cols-[1fr_auto]")}> 
          <div>
            {heading ? <CardTitle>{heading}</CardTitle> : null}
            {subheading ? <CardDescription>{subheading}</CardDescription> : null}
          </div>
          {action ? <div data-slot="card-action">{action}</div> : null}
        </CardHeader>
      )}
      <CardContent className={cn(contentClassName)}>{children}</CardContent>
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  )
}

export default GlassPanel
