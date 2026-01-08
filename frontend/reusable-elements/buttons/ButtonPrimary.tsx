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

const ButtonPrimary = React.forwardRef<HTMLButtonElement, ButtonProps>(
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

    // For gradient border effect
    const wrapperClass = variant === "default" 
      ? "relative inline-block rounded-full p-[1px] bg-gradient-to-r from-[#748ed3] via-[#748ed3] to-[#2c4892]" 
      : ""

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

    if (variant === "default") {
      return (
        <div className={wrapperClass}>
          <button
            className={cn("rounded-full bg-gradient-to-br from-[#293b64] to-[#1e2c4e] text-white text-sm font-semibold inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:shadow-lg hover:shadow-[#748ed3]/30 dark:from-[#293b64] dark:to-[#1e2c4e] cursor-pointer", sizes[size], className)}
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
ButtonPrimary.displayName = "ButtonPrimary"

export { ButtonPrimary }

