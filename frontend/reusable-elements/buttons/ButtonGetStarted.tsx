'use client';

import * as React from "react"
import { cn } from "@/lib/utils"
import { useAnalytics } from "@/hooks/useAnalytics"

export interface ButtonGetStartedProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  buttonName?: string
  disableTracking?: boolean
}

const ButtonGetStarted = React.forwardRef<HTMLButtonElement, ButtonGetStartedProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      buttonName,
      disableTracking = false,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const { trackButton } = useAnalytics()

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e)

        if (!disableTracking) {
          const dataAttr = e.currentTarget.getAttribute("data-analytics-button")
          const text = e.currentTarget.textContent?.trim()
          const nameToTrack = buttonName || dataAttr || text || "Get Started Button"

          trackButton(nameToTrack, { variant, size }).catch(console.error)
        }
      },
      [onClick, trackButton, buttonName, disableTracking, variant, size]
    )

    // 🔧 FIXED: font-weight + letter-spacing
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium tracking-[0.27px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"

    const variants = {
      default:
        "bg-[#1a1a1a] rounded-[55.98px] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(0,0,0,0.5),0_2px_4px_rgba(0,0,0,0.3)] hover:bg-[#222222] hover:shadow-[inset_1px_1px_2px_rgba(255,255,255,0.12),inset_-1px_-1px_2px_rgba(0,0,0,0.6),0_3px_6px_rgba(0,0,0,0.4)] active:scale-[0.98]",
      outline:
        "bg-transparent border border-[#3291FF]/30 rounded-[55.98px] hover:bg-[#3291FF]/10 hover:border-[#3291FF]/50",
      ghost:
        "bg-transparent rounded-[55.98px] hover:bg-[#3291FF]/10",
    }

    // 🔧 FIXED: exact Figma size
    const sizes = {
      default: "h-[40px] w-[120px] px-4 py-2",
      sm: "h-8 px-4 text-xs",
      lg: "h-11 px-7 text-base",
    }

    if (variant === "default") {
      const gradientStyle =
        "conic-gradient(from 45deg, rgba(255,255,255,0.1) 0deg, rgba(255,255,255,0.4) 90deg, rgba(255,255,255,0.1) 180deg, rgba(255,255,255,0.4) 270deg, rgba(255,255,255,0.1) 360deg)"

      return (
        <div
          className="relative inline-block rounded-[55.98px] p-[1px]"
          style={{ background: gradientStyle }}
        >
          <div
            className="relative rounded-[55.98px]"
            style={{ backgroundColor: "#0a1628" }}
          >
            <button
              ref={ref}
              onClick={handleClick}
              suppressHydrationWarning
              className={cn(
                baseStyles,
                sizes[size],
                "relative rounded-[55.98px] bg-gradient-to-b from-white/[0.01] to-white/[0.02] border-0 shadow-lg shadow-black/30 backdrop-blur-lg before:absolute before:inset-0 before:rounded-[inherit] before:pointer-events-none before:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.005),rgba(255,255,255,0.02))] hover:from-white/[0.015] hover:to-white/[0.025] hover:shadow-xl hover:shadow-black/40 active:scale-[0.98]",
                className
              )}
              {...props}
            >
              <span className="relative z-10 bg-gradient-to-r from-[#3291FF] to-[#405998] bg-clip-text text-transparent">
                {children}
              </span>
            </button>
          </div>
        </div>
      )
    }

    return (
      <button
        ref={ref}
        onClick={handleClick}
        suppressHydrationWarning
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        <span className="bg-gradient-to-r from-[#3291FF] to-[#405998] bg-clip-text text-transparent">
          {children}
        </span>
      </button>
    )
  }
)

ButtonGetStarted.displayName = "ButtonGetStarted"

export { ButtonGetStarted }
