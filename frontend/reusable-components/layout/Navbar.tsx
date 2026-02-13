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
  // This is true when:
  // - No navigation items
  // - Actions is an array with only one item of type 'signout'
  // OR when hideNavbarContainer prop is explicitly set to true
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
                className="inline-flex items-center rounded-[53px] backdrop-blur-2xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] p-[1px] relative transition-all"
                style={{
                  background: 'linear-gradient(to right, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.1) 6%, rgba(255, 255, 255, 0.15) 13%, rgba(255, 255, 255, 0.25) 25%, rgba(255, 255, 255, 0.4) 42%, rgba(255, 255, 255, 0.4) 44%, rgba(255, 255, 255, 0.25) 69%, rgba(255, 255, 255, 0.15) 83%, rgba(255, 255, 255, 0.1) 91%, rgba(255, 255, 255, 0.08) 100%)',
                }}
              >
                <div className="inline-flex items-center gap-[10px] rounded-[53px] px-[10px] py-[6px]" style={{ backgroundColor: '#050608' }}>
                  <nav className="hidden md:flex items-center gap-1">
                    {items && items.length > 0 ? (
                      <>
                        {items.map((it) => {
                          // Use exact matching to prevent multiple highlights
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
                      </>
                    ) : null}
                    {breadcrumbs && (
                      <>
                        {React.isValidElement(breadcrumbs) && 
                         breadcrumbs.type === React.Fragment ? (
                          // If breadcrumbs is a Fragment, render children directly
                          (breadcrumbs.props as { children?: React.ReactNode }).children
                        ) : (
                          // Single breadcrumb item
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
                    // If breadcrumbs is a Fragment, render children separately (for multiple separate items)
                    <div className="flex items-center gap-2">
                      {(breadcrumbs.props as { children?: React.ReactNode }).children}
                    </div>
                  ) : (
                    // Single breadcrumb item - wrap in glass panel
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
                      // Use exact matching to prevent multiple highlights
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

