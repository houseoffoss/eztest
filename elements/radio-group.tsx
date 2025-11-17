"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

type RadioItemProps = React.ComponentProps<typeof RadioGroupPrimitive.Item> & {
  variant?: "default" | "glass"
}

function RadioGroupItem({ className, variant = "default", ...props }: RadioItemProps) {
  const base = "aspect-square size-5 shrink-0 rounded-full transition-all outline-none cursor-pointer text-accent"
  const defaultStyles = "border border-border bg-background data-[state=checked]:border-accent/60"
  const glassStyles = "border border-white/25 bg-white/10 backdrop-blur-md shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] data-[state=checked]:border-accent/60"

  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        base,
        variant === "glass" ? glassStyles : defaultStyles,
  "hover:border-accent/50 focus-visible:border-accent/60 focus-visible:ring-1 focus-visible:ring-accent/35 aria-invalid:ring-destructive/20 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
  <CircleIcon className="fill-accent/70 absolute top-1/2 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
