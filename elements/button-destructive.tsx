import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "light" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

const ButtonDestructive = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"

    const variants = {
      default: "bg-gradient-to-br from-[#642424] to-[#4e1a1a] text-white border-2 border-transparent bg-clip-padding border-image-source-gradient rounded-full hover:shadow-lg hover:shadow-[#dc2626]/30 relative overflow-hidden dark:from-[#642424] dark:to-[#4e1a1a]",
      light: "bg-transparent text-[#dc2626] border-2 border-[#dc2626] rounded-full hover:bg-[#dc2626]/10 hover:border-[#dc2626]/80 dark:text-[#dc2626] dark:border-[#dc2626]/80",
      outline: "border-2 border-[#dc2626] text-[#dc2626] bg-transparent rounded-full hover:bg-[#dc2626]/10 hover:border-[#dc2626]/80 dark:border-[#dc2626]/80 dark:text-[#dc2626]",
      ghost: "text-[#dc2626] hover:bg-[#dc2626]/20 border-none rounded-full dark:text-[#dc2626]",
    }

    const sizes = {
      default: "h-9 px-5 py-2",
      sm: "h-8 px-4 text-xs",
      lg: "h-11 px-7 text-base",
      icon: "h-9 w-9 p-0",
    }

    if (variant === "default") {
      return (
        <div className="relative inline-block rounded-full p-[1px] bg-gradient-to-r from-[#ef4444] via-[#ef4444] to-[#991b1b]">
          <button
            className={cn("rounded-full bg-gradient-to-br from-[#642424] to-[#4e1a1a] text-white text-sm font-semibold inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:shadow-lg hover:shadow-[#dc2626]/30 dark:from-[#642424] dark:to-[#4e1a1a] cursor-pointer", sizes[size], className)}
            ref={ref}
            {...props}
          />
        </div>
      )
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
ButtonDestructive.displayName = "ButtonDestructive"

export { ButtonDestructive }
