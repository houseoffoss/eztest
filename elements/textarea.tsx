import * as React from "react"

import { cn } from "@/lib/utils"

type TextareaProps = React.ComponentProps<"textarea"> & {
  variant?: "default" | "glass"
}

function Textarea({ className, variant = "default", ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-white/50 selection:bg-primary selection:text-primary-foreground flex field-sizing-content min-h-24 w-full rounded-[10px] border px-4 py-3 text-base transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm backdrop-blur-xl",
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

export { Textarea }
