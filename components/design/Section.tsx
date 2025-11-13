import * as React from "react"
import { cn } from "@/lib/utils"

export interface SectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  heading?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  spacing?: "sm" | "md" | "lg"
}

export function Section({
  heading,
  description,
  actions,
  spacing = "md",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        "flex flex-col",
        spacing === "sm" && "gap-3",
        spacing === "md" && "gap-4",
        spacing === "lg" && "gap-6",
        className
      )}
      {...props}
    >
      {(heading || description || actions) && (
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            {heading ? <h2 className="text-lg font-semibold text-white">{heading}</h2> : null}
            {description ? <p className="text-sm text-white/70">{description}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  )
}

export default Section
