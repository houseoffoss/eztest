'use client';

import * as React from "react"
import { cn } from "@/lib/utils"
import { useAnalytics } from "@/hooks/useAnalytics"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "light" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  /** Button name for analytics tracking (auto-detected from data-analytics-button if not provided) */
  buttonName?: string
  /** Disable analytics tracking for this button */
  disableTracking?: boolean
}

const ButtonSecondary = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", buttonName, disableTracking = false, onClick, ...props }, ref) => {
    const { trackButton } = useAnalytics();

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        // Call original onClick handler first
        if (onClick) {
          onClick(e);
        }

        // Track button click if enabled (runs after onClick is called)
        // Analytics tracking is fire-and-forget and won't block the original logic
        if (!disableTracking) {
          // Get button name from various sources
          const dataAttr = (e.currentTarget as HTMLElement)?.getAttribute('data-analytics-button');
          const children = (e.currentTarget as HTMLElement)?.textContent?.trim();
          const nameToTrack = buttonName || dataAttr || children || 'Button';
          // Track asynchronously without blocking (fire-and-forget)
          trackButton(nameToTrack, {
            variant,
            size,
          }).catch((error) => {
            // Silently fail - analytics should not break the app
            console.error('Failed to track button click:', error);
          });
        }
      },
      [onClick, trackButton, buttonName, disableTracking, variant, size]
    );
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"

    const variants = {
      default: "bg-gradient-to-br from-[#4d3c32] to-[#342720] text-white border-2 border-transparent bg-clip-padding border-image-source-gradient rounded-full hover:shadow-lg hover:shadow-[#905320]/30 relative overflow-hidden dark:from-[#4d3c32] dark:to-[#342720]",
      light: "bg-transparent text-[#905320] border-2 border-[#905320] rounded-full hover:bg-[#4d3c32]/20 hover:border-[#905320]/80 dark:text-[#905320] dark:border-[#905320]/80",
      outline: "border-2 border-[#905320] text-[#905320] bg-transparent rounded-full hover:bg-[#4d3c32]/10 hover:border-[#905320]/80 dark:border-[#905320]/80 dark:text-[#905320]",
      ghost: "text-[#905320] hover:bg-[#4d3c32]/20 border-none rounded-full dark:text-[#905320]",
    }

    const sizes = {
      default: "h-9 px-5 py-2",
      sm: "h-8 px-4 text-xs",
      lg: "h-11 px-7 text-base",
      icon: "h-9 w-9 p-0",
    }

    if (variant === "default") {
      return (
        <div className="relative inline-block rounded-full p-[1px] bg-gradient-to-r from-[#905320] via-[#905320] to-[#4b372c]">
          <button
            className={cn("rounded-full bg-gradient-to-br from-[#4d3c32] to-[#342720] text-white text-sm font-semibold inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:shadow-lg hover:shadow-[#905320]/30 dark:from-[#4d3c32] dark:to-[#342720] cursor-pointer", sizes[size], className)}
            ref={ref}
            suppressHydrationWarning
            onClick={handleClick}
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
        onClick={handleClick}
        {...props}
      />
    )
  }
)
ButtonSecondary.displayName = "ButtonSecondary"

export { ButtonSecondary }

