import * as React from "react"

import { cn } from "@/lib/utils"

type InputProps = React.ComponentProps<"input"> & {
  variant?: "default" | "glass"
}

function Input({ className, type, variant = "default", ...props }: InputProps) {
  return (
    <input
      suppressHydrationWarning
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-white/50 selection:bg-primary selection:text-primary-foreground h-10 w-full min-w-0 rounded-[10px] border px-4 py-2 text-base transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm backdrop-blur-xl",
        variant === "glass"
          ? "bg-[#101a2b]/70 border-white/15 text-white/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] rounded-[10px] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
          : "border-border bg-transparent focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent",
        // Date input specific styles - make calendar icon visible with theme colors
        type === "date" && "[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-[0.7] [&::-webkit-calendar-picker-indicator]:hover:brightness-[0.9] [&::-webkit-calendar-picker-indicator]:transition-all",
        className
      )}
      {...props}
    />
  )
}

export { Input }
