"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  variant?: "default" | "glass"
}

function Checkbox({ className, variant = "default", ...props }: CheckboxProps) {
  const base = "peer size-5 shrink-0 rounded transition-all outline-none cursor-pointer"
  const defaultStyles = cn(
    "border border-border bg-background",
    "data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground data-[state=checked]:border-accent",
    // Subtle accent feedback on hover/focus to match selection theme
    "hover:border-accent/70 focus-visible:border-accent focus-visible:ring-accent/30"
  )
  const glassStyles = cn(
    "border border-white/25 bg-white/10 backdrop-blur-md shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]",
    "data-[state=checked]:bg-accent/45 data-[state=checked]:border-accent/60",
    "hover:border-accent/60 focus-visible:border-accent focus-visible:ring-accent/30"
  )

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        base,
        variant === "glass" ? glassStyles : defaultStyles,
        "hover:border-ring/60 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
