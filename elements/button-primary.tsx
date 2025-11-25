import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "light" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

const ButtonPrimary = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"

    const variants = {
      default: "bg-gradient-to-br from-[#293b64] to-[#1e2c4e] text-white border-2 border-transparent bg-clip-padding border-image-source-gradient rounded-full hover:shadow-lg hover:shadow-[#748ed3]/30 relative overflow-hidden dark:from-[#293b64] dark:to-[#1e2c4e]",
      light: "bg-transparent text-[#748ed3] border-2 border-[#748ed3] rounded-full hover:bg-[#293b64]/20 hover:border-[#748ed3]/80 dark:text-[#748ed3] dark:border-[#748ed3]/80",
      outline: "border-2 border-[#748ed3] text-[#748ed3] bg-transparent rounded-full hover:bg-[#293b64]/10 hover:border-[#748ed3]/80 dark:border-[#748ed3]/80 dark:text-[#748ed3]",
      ghost: "text-[#748ed3] hover:bg-[#293b64]/20 border-none rounded-full dark:text-[#748ed3]",
    }

    const sizes = {
      default: "h-9 px-5 py-2",
      sm: "h-8 px-4 text-xs",
      lg: "h-11 px-7 text-base",
      icon: "h-9 w-9 p-0",
    }

    // For gradient border effect
    const wrapperClass = variant === "default" 
      ? "relative inline-block rounded-full" 
      : ""

    if (variant === "default") {
      return (
        <div className="relative inline-block rounded-full p-[1px] bg-gradient-to-r from-[#748ed3] via-[#748ed3] to-[#2c4892]">
          <button
            className={cn("rounded-full bg-gradient-to-br from-[#293b64] to-[#1e2c4e] text-white text-sm font-semibold inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:shadow-lg hover:shadow-[#748ed3]/30 dark:from-[#293b64] dark:to-[#1e2c4e] cursor-pointer", sizes[size], className)}
            ref={ref}
            suppressHydrationWarning
            {...props}
          />
        </div>
      )
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        suppressHydrationWarning
        {...props}
      />
    )
  }
)
ButtonPrimary.displayName = "ButtonPrimary"

export { ButtonPrimary }
