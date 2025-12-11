import * as React from "react"

import { cn } from "@/lib/utils"

type TextareaProps = React.ComponentProps<"textarea"> & {
  variant?: "default" | "glass"
  maxLength?: number
  showCharCount?: boolean
}

function Textarea({ 
  className, 
  variant = "default", 
  maxLength,
  showCharCount = true,
  value,
  onChange,
  ...props 
}: TextareaProps) {
  const [charCount, setCharCount] = React.useState(0);
  const [isOverLimit, setIsOverLimit] = React.useState(false);

  React.useEffect(() => {
    const text = typeof value === 'string' ? value : '';
    setCharCount(text.length);
    setIsOverLimit(maxLength ? text.length > maxLength : false);
  }, [value, maxLength]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e);
  };

  return (
    <div className="w-full">
      <textarea
        data-slot="textarea"
        className={cn(
          "placeholder:text-white/50 selection:bg-primary selection:text-primary-foreground flex min-h-24 max-h-48 w-full rounded-[10px] border px-4 py-3 text-base transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm backdrop-blur-xl resize-none overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
          variant === "glass"
            ? "bg-[#101a2b]/70 border-white/15 text-white/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] rounded-[10px]"
            : "border-border/40 bg-input",
          "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          isOverLimit && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/40",
          className
        )}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        {...props}
      />
      {showCharCount && maxLength && (
        <div className={cn(
          "text-xs mt-1 text-right",
          isOverLimit ? "text-red-500" : "text-white/60"
        )}>
          {charCount}/{maxLength} characters
        </div>
      )}
    </div>
  )
}

export { Textarea }
