"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useNavbarActions, type ActionButtonConfig } from "@/hooks/useNavbarActions";

export type NavItem = { label: string; href: string };

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  brandHref?: string;
  brandLabel?: React.ReactNode;
  items?: NavItem[];
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode | ActionButtonConfig[];
  containerClassName?: string;
  hideNavbarContainer?: boolean;
  variant?: 'app' | 'marketing';
}

export function Navbar({
  brandHref = "/",
  brandLabel = (
    <div className="flex items-center gap-2">
      <Image src="/favicon.png" alt="EZTest" width={24} height={24} className="w-6 h-6" />
      <span className="text-lg font-semibold">EZTest</span>
    </div>
  ),
  items,
  breadcrumbs,
  actions,
  className,
  containerClassName,
  hideNavbarContainer = false,
  variant = 'app',
  ...props
}: NavbarProps) {
  const pathname = usePathname();
  const { renderActionButtons } = useNavbarActions();

  // Convert config array to JSX if needed
  const renderedActions = React.useMemo(() => {
    if (!actions) return null;
    
    // If actions is an array of configs, render them
    if (Array.isArray(actions)) {
      return renderActionButtons(actions);
    }
    
    // Otherwise, it's already JSX, return as-is
    return actions;
  }, [actions, renderActionButtons]);

  // Check if we have only a sign-out button
  const hasOnlySignOutButton = hideNavbarContainer || (
    (!items || items.length === 0) && 
    Array.isArray(actions) && 
    actions.length === 1 && 
    actions[0].type === 'signout'
  );

  // Marketing variant (new design with centered nav and gradient border)
  if (variant === 'marketing') {
    return (
      <header className={cn("sticky top-4 z-50", className)} {...props}>
        <div className={cn("w-full px-4 sm:px-6 lg:px-8", containerClassName)}>
          <div className="flex items-center justify-center gap-3 w-full relative">
            {/* Left side: Brand */}
            {brandLabel ? (
              <div className="flex items-center gap-3 absolute left-0">
                <Link href={brandHref} className="shrink-0 inline-flex items-center">
                  {brandLabel}
                </Link>
              </div>
            ) : null}

            {/* Center: Nav items + Breadcrumbs */}
            {((items && items.length > 0) || breadcrumbs) ? (
              <div 
                className="inline-flex items-center relative rounded-[100px] p-[1px]"
                style={{
                  minWidth: items && items.length > 0 ? '550px' : 'auto',
                  // UPDATED: 
                  // 1. Extended bright hold to 145deg (Top) and 325deg (Bottom).
                  //    This pushes the white color very close to the corners before fading.
                  // 2. Thin corners remain locked at 175deg and 355deg.
                  background: 'conic-gradient(from 275deg, rgba(255, 255, 255, 0.4) 0deg, rgba(255, 255, 255, 0.4) 145deg, rgba(255, 255, 255, 0.05) 175deg, rgba(255, 255, 255, 0.4) 180deg, rgba(255, 255, 255, 0.4) 325deg, rgba(255, 255, 255, 0.05) 355deg, rgba(255, 255, 255, 0.4) 360deg)',
                }}
              >
                <div
                  className="inline-flex items-center relative rounded-[100px] h-full w-full overflow-hidden"
                  style={{
                    height: '52px',
                    borderRadius: '100px',
                    background: 'linear-gradient(to bottom, rgba(5, 6, 8, 0.92) 0%, rgba(5, 6, 8, 0.98) 100%)',
                    paddingTop: '6px',
                    paddingRight: '10px',
                    paddingBottom: '6px',
                    paddingLeft: '10px',
                    gap: '10px',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 10px 30px -12px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  {/* Refraction gradient overlay - transparent at top, glass effect at bottom */}
                  <div
                    className="absolute inset-0 pointer-events-none rounded-[100px]"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.06) 100%)',
                    }}
                  />
                <nav className="hidden md:flex items-center gap-1 relative z-10">
                  {items && items.length > 0 ? (
                    <>
                      {items.map((it) => {
                        const active = pathname === it.href;
                        return (
                          <div
                            key={it.href}
                            className="relative group"
                          >
                            {!active && (
                              <div
                                className="glassy-overlay absolute inset-0 rounded-full pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100 overflow-hidden"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.075)',
                                  backdropFilter: 'blur(36px) saturate(220%)',
                                  border: '1px solid rgba(255, 255, 255, 0.18)',
                                  boxShadow:
                                    '0 8px 20px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.16), inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
                                  zIndex: 10,
                                }}
                              >
                                {/* Match navbar "bottom refraction" glass overlay */}
                                <div
                                  className="absolute inset-0"
                                  style={{
                                    background:
                                      'linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.11) 100%)',
                                  }}
                                />
                                {/* Extra specular highlight (top sheen) */}
                                <div
                                  className="absolute inset-0"
                                  style={{
                                    background:
                                      'linear-gradient(to bottom, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 55%)',
                                    mixBlendMode: 'overlay',
                                    opacity: 0.7,
                                  }}
                                />
                              </div>
                            )}
                            <Link
                              href={it.href}
                              className={cn(
                                "relative z-10 px-4 py-2 rounded-full transition-all cursor-pointer block",
                                active
                                  ? "bg-white/12 shadow-inner"
                                  : ""
                              )}
                              style={{
                                fontFamily: 'Inter',
                                fontWeight: 500,
                                fontSize: '14px',
                                lineHeight: '100%',
                                letterSpacing: '0.2px',
                                verticalAlign: 'middle',
                                background: 'linear-gradient(90deg, #F3F3F3 0%, #5C5C5C 100%)',
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                color: 'transparent',
                              }}
                              aria-current={active ? "page" : undefined}
                            >
                              {it.label}
                            </Link>
                          </div>
                        );
                      })}
                    </>
                  ) : null}
                  {breadcrumbs && (
                    <>
                      {React.isValidElement(breadcrumbs) && 
                       breadcrumbs.type === React.Fragment ? (
                        (breadcrumbs.props as { children?: React.ReactNode }).children
                      ) : (
                        breadcrumbs
                      )}
                    </>
                  )}
                </nav>
                </div>
              </div>
            ) : null}

            {/* Right side: Actions */}
            {renderedActions ? (
              hasOnlySignOutButton ? (
                <div className="absolute right-0">
                  {renderedActions}
                </div>
              ) : (
                <div className="absolute right-0">
                  {renderedActions}
                </div>
              )
            ) : null}
          </div>
        </div>
      </header>
    );
  }

  // App variant (old design - default for logged-in pages)
  return (
    <header className={cn("sticky top-4 z-50", className)} {...props}>
      <div className={cn("w-full px-4 sm:px-6 lg:px-8", containerClassName)}>
        <div className="flex items-center justify-between gap-3 w-full">
          {/* Left side: Brand + Breadcrumbs */}
          {brandLabel || breadcrumbs ? (
            <div className="flex items-center gap-3">
              {brandLabel && (
                <Link href={brandHref} className="shrink-0">
                  <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl px-3 py-2 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/5">
                    {brandLabel}
                  </span>
                </Link>
              )}
              {breadcrumbs && (
                <>
                  {React.isValidElement(breadcrumbs) && 
                   breadcrumbs.type === React.Fragment ? (
                    <div className="flex items-center gap-2">
                      {(breadcrumbs.props as { children?: React.ReactNode }).children}
                    </div>
                  ) : (
                    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl px-3 py-2 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/5">
                      {breadcrumbs}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* Right side: Nav + actions */}
          {(items && items.length > 0) || renderedActions ? (
            hasOnlySignOutButton ? (
              <div className="ml-auto">
                {renderedActions}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl p-1 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/5 ml-auto">
                {items && items.length > 0 ? (
                  <nav className="hidden md:flex items-center gap-1">
                    {items.map((it) => {
                      const active = pathname === it.href;
                      return (
                        <Link
                          key={it.href}
                          href={it.href}
                          className={cn(
                            "px-4 py-2 text-sm rounded-full transition-colors cursor-pointer",
                            active
                              ? "bg-white/12 text-white shadow-inner"
                              : "text-white/80 hover:text-white hover:bg-white/8"
                          )}
                          aria-current={active ? "page" : undefined}
                        >
                          {it.label}
                        </Link>
                      );
                    })}
                  </nav>
                ) : null}

                {renderedActions ? (
                  <div className="hidden sm:flex items-center gap-2 pl-1">
                    {renderedActions}
                  </div>
                ) : null}
              </div>
            )
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default Navbar;