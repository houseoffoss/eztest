import * as React from "react"

import { cn } from "@/lib/utils"

type TextareaProps = React.ComponentProps<"textarea"> & {
  variant?: "default" | "glass"
  maxWords?: number
  showWordCount?: boolean
}

function Textarea({ 
  className, 
  variant = "default", 
  maxWords = 250,
  showWordCount = true,
  value,
  onChange,
  ...props 
}: TextareaProps) {
  const [wordCount, setWordCount] = React.useState(0);
  const [isOverLimit, setIsOverLimit] = React.useState(false);

  const countWords = (text: string) => {
    const trimmed = text.trim();
    if (trimmed === '') return 0;
    return trimmed.split(/\s+/).length;
  };

  React.useEffect(() => {
    const text = typeof value === 'string' ? value : '';
    const count = countWords(text);
    setWordCount(count);
    setIsOverLimit(count > maxWords);
  }, [value, maxWords]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const count = countWords(text);
    
    if (count <= maxWords) {
      onChange?.(e);
    }
  };

  return (
    <div className="w-full">
      <textarea
        data-slot="textarea"
        className={cn(
          "placeholder:text-white/50 selection:bg-primary selection:text-primary-foreground flex field-sizing-content min-h-24 w-full rounded-[10px] border px-4 py-3 text-base transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm backdrop-blur-xl",
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
        {...props}
      />
      {showWordCount && (
        <div className={cn(
          "text-xs mt-1 text-right",
          isOverLimit ? "text-red-500" : "text-white/60"
        )}>
          {wordCount}/{maxWords} words
        </div>
      )}
    </div>
  )
}

export { Textarea }
