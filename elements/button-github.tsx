import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "light" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

const ButtonGithub = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"

    const variants = {
      default: "bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a] text-white border-2 border-transparent bg-clip-padding border-image-source-gradient rounded-full hover:shadow-lg hover:shadow-[#646464]/30 relative overflow-hidden dark:from-[#2d2d2d] dark:to-[#1a1a1a]",
      light: "bg-transparent text-[#646464] border-2 border-[#646464] rounded-full hover:bg-[#2d2d2d]/20 hover:border-[#646464]/80 dark:text-[#646464] dark:border-[#646464]/80",
      outline: "border-2 border-[#646464] text-[#646464] bg-transparent rounded-full hover:bg-[#2d2d2d]/10 hover:border-[#646464]/80 dark:border-[#646464]/80 dark:text-[#646464]",
      ghost: "text-[#646464] hover:bg-[#2d2d2d]/20 border-none rounded-full dark:text-[#646464]",
    }

    const sizes = {
      default: "h-9 px-5 py-2",
      sm: "h-8 px-4 text-xs",
      lg: "h-11 px-7 text-base",
      icon: "h-9 w-9 p-0",
    }

    if (variant === "default") {
      return (
        <div className="relative inline-block rounded-full p-[1px] bg-gradient-to-r from-[#646464] via-[#646464] to-[#404040]">
          <button
            className={cn("rounded-full bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a] text-white text-sm font-semibold inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:shadow-lg hover:shadow-[#646464]/30 dark:from-[#2d2d2d] dark:to-[#1a1a1a] cursor-pointer", sizes[size], className)}
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

ButtonGithub.displayName = "ButtonGithub"

export { ButtonGithub }
