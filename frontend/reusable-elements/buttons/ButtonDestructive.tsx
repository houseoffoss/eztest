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

const ButtonDestructive = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", buttonName, disableTracking = false, onClick, ...props }, ref) => {
    const { trackButton } = useAnalytics();

    const handleClick = React.useCallback(
      async (e: React.MouseEvent<HTMLButtonElement>) => {
        // Call original onClick handler first
        // Note: onClick is typed as void, so we call it synchronously
        // If the handler needs async behavior, it should handle that internally
        if (onClick) {
          onClick(e);
        }

        // Track button click if enabled (runs after onClick is called)
        // Analytics tracking is fire-and-forget and won't block the original logic
        if (!disableTracking) {
          // Get button name from various sources
          const dataAttr = (e.currentTarget as HTMLElement)?.getAttribute('data-analytics-button');
          const nameToTrack = buttonName || dataAttr || (typeof props.children === 'string' ? props.children : 'Button');
          try {
            // Track asynchronously without blocking
            trackButton(nameToTrack, {
              variant,
              size,
              type: 'destructive',
            }).catch((error) => {
              // Silently fail - analytics should not break the app
              console.error('Failed to track button click:', error);
            });
          } catch (error) {
            // Silently fail - analytics should not break the app
            console.error('Failed to track button click:', error);
          }
        }
      },
      [onClick, trackButton, buttonName, disableTracking, variant, size, props]
    );
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
        onClick={handleClick}
        {...props}
      />
    )
  }
)
ButtonDestructive.displayName = "ButtonDestructive"

export { ButtonDestructive }

