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
          ? "bg-[#101a2b]/70 border-white/15 text-white/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] rounded-[10px]"
          : "border-border/40 bg-input",
  "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
