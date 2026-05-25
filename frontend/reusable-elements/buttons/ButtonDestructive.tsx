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
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick) {
          onClick(e);
        }

        if (!disableTracking) {
          const dataAttr = (e.currentTarget as HTMLElement)?.getAttribute('data-analytics-button');
          const children = (e.currentTarget as HTMLElement)?.textContent?.trim();
          const nameToTrack = buttonName || dataAttr || children || 'Button';
          trackButton(nameToTrack, {
            variant,
            size,
            type: 'destructive',
          }).catch((error) => {
            console.error('Failed to track button click:', error);
          });
        }
      },
      [onClick, trackButton, buttonName, disableTracking, variant, size]
    );

    const sizes = {
      default: "h-auto px-4 py-2",
      sm: "h-8 px-3 text-xs",
      lg: "h-11 px-6 text-base",
      icon: "h-9 w-9 p-0",
    }

    // Glass morphism style with red gradient
    if (variant === "default") {
      return (
        <div
          className="inline-flex items-center relative rounded-[100px] transition-all cursor-pointer"
          style={{
            height: size === "lg" ? "44px" : size === "sm" ? "32px" : "36px",
            backgroundColor: 'rgba(51, 51, 51, 0.10)',
            paddingTop: '6px',
            paddingRight: '10px',
            paddingBottom: '6px',
            paddingLeft: '10px',
            gap: '10px',
            backdropFilter: 'blur(40px)',
            boxShadow: '0 10px 30px -12px rgba(0, 0, 0, 0.6)',
          }}
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.backgroundColor = 'rgba(51, 51, 51, 0.32)';
            target.style.boxShadow = '0 18px 45px -18px rgba(0, 0, 0, 0.95)';
            target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.backgroundColor = 'rgba(51, 51, 51, 0.10)';
            target.style.boxShadow = '0 10px 30px -12px rgba(0, 0, 0, 0.6)';
            target.style.transform = 'translateY(0)';
          }}
        >
          <div
            className="absolute -inset-[1px] rounded-[100px] pointer-events-none -z-10"
            style={{
              background: 'conic-gradient(from 339deg, rgba(255, 255, 255, 0.4) 0deg, rgba(255, 255, 255, 0.4) 70deg, rgba(255, 255, 255, 0.05) 90deg, rgba(255, 255, 255, 0.4) 120deg, rgba(255, 255, 255, 0.4) 240deg, rgba(255, 255, 255, 0.05) 270deg, rgba(255, 255, 255, 0.4) 360deg)',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              padding: '1px',
            }}
          />
          <button
            ref={ref}
            className={cn("relative z-10 px-4 py-2 transition-colors cursor-pointer border-0 outline-none flex items-center justify-center gap-2", className)}
            style={{
              background: 'transparent',
              fontFamily: 'Inter',
              fontWeight: 500,
              fontSize: size === "lg" ? "16px" : size === "sm" ? "12px" : "14px",
              lineHeight: size === "lg" ? "24px" : size === "sm" ? "18px" : "21.85px",
              letterSpacing: '0.27px',
              textAlign: 'center',
              verticalAlign: 'middle',
            }}
            onClick={handleClick}
            suppressHydrationWarning
            {...props}
          >
            {React.Children.map(props.children, (child) => {
              if (typeof child === 'string' || typeof child === 'number') {
                return (
                  <span
                    style={{
                      backgroundImage: 'linear-gradient(94.37deg, #EF4444 11.75%, #991B1B 88.32%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    {child}
                  </span>
                )
              }
              return child
            })}
          </button>
        </div>
      )
    }

    // Light variant
    if (variant === "light") {
      return (
        <button
          ref={ref}
          className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-[100px] transition-all cursor-pointer h-9 px-5 py-2", className)}
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#EF4444',
            boxShadow: '0 10px 30px -12px rgba(0, 0, 0, 0.6)',
          }}
          onClick={handleClick}
          suppressHydrationWarning
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
            target.style.boxShadow = '0 18px 45px -18px rgba(239, 68, 68, 0.4)';
            target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            target.style.boxShadow = '0 10px 30px -12px rgba(0, 0, 0, 0.6)';
            target.style.transform = 'translateY(0)';
          }}
          {...props}
        />
      )
    }

    // Outline variant
    if (variant === "outline") {
      return (
        <button
          ref={ref}
          className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-[100px] transition-all cursor-pointer h-9 px-5 py-2", className)}
          style={{
            backgroundColor: 'transparent',
            backdropFilter: 'blur(40px)',
            border: '2px solid #EF4444',
            color: '#EF4444',
            boxShadow: '0 10px 30px -12px rgba(0, 0, 0, 0.6)',
          }}
          onClick={handleClick}
          suppressHydrationWarning
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            target.style.boxShadow = '0 18px 45px -18px rgba(239, 68, 68, 0.4)';
            target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.backgroundColor = 'transparent';
            target.style.boxShadow = '0 10px 30px -12px rgba(0, 0, 0, 0.6)';
            target.style.transform = 'translateY(0)';
          }}
          {...props}
        />
      )
    }

    // Ghost variant
    if (variant === "ghost") {
      return (
        <button
          ref={ref}
          className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-[100px] transition-all cursor-pointer h-9 px-5 py-2", className)}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#EF4444',
          }}
          onClick={onClick}
          suppressHydrationWarning
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.backgroundColor = 'transparent';
          }}
          {...props}
        />
      )
    }

    return (
      <button
        ref={ref}
        className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-[100px]", sizes[size], className)}
        onClick={handleClick}
        suppressHydrationWarning
        {...props}
      />
    )
  }
)
ButtonDestructive.displayName = "ButtonDestructive"

export { ButtonDestructive }

