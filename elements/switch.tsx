"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> & {
  variant?: "default" | "glass"
}

function Switch({ className, variant = "default", ...props }: SwitchProps) {
  const baseRoot =
    "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all outline-none cursor-pointer"
  const defaultRoot = cn(
    "border border-border",
    "data-[state=checked]:bg-accent data-[state=checked]:border-accent",
    "data-[state=unchecked]:bg-background",
    "focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent/40",
    "disabled:cursor-not-allowed disabled:opacity-50"
  )
  const glassRoot = cn(
    "border border-white/25 bg-white/10 backdrop-blur-md shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]",
    "data-[state=checked]:bg-accent/45 data-[state=checked]:border-accent/50",
    "data-[state=unchecked]:bg-white/10",
    "focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent/40",
    "disabled:cursor-not-allowed disabled:opacity-50"
  )

  const baseThumb =
    "pointer-events-none block size-5 rounded-full transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
  const defaultThumb = "bg-background shadow-sm ring-0"
  const glassThumb = cn(
    "bg-white/80 dark:bg-white/70 border border-white/40 shadow-md ring-0"
  )

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(baseRoot, variant === "glass" ? glassRoot : defaultRoot, className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(baseThumb, variant === "glass" ? glassThumb : defaultThumb)}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
