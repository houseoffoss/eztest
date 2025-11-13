"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export type NavItem = { label: string; href: string };

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  brandHref?: string;
  brandLabel?: React.ReactNode;
  items?: NavItem[];
  actions?: React.ReactNode;
  containerClassName?: string;
}

export function Navbar({
  brandHref = "/",
  brandLabel = (
    <div className="flex items-center gap-2">
      <span className="text-2xl leading-none">🧪</span>
      <span className="text-lg font-semibold">EZTest</span>
    </div>
  ),
  items,
  actions,
  className,
  containerClassName,
  ...props
}: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className={cn("sticky top-4 z-50", className)} {...props}>
      <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", containerClassName)}>
        <div className="flex items-center justify-between gap-3">
          {/* Left capsule: Brand */}
          <Link href={brandHref} className="shrink-0">
            <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl px-3 py-2 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/5">
              {brandLabel}
            </span>
          </Link>

          {/* Right capsule: Nav + actions */}
          {(items && items.length > 0) || actions ? (
            <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl p-1 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/5">
              {items && items.length > 0 ? (
                <nav className="hidden md:flex items-center gap-1">
                  {items.map((it) => {
                    const active = pathname && (pathname === it.href || pathname.startsWith(it.href + "/"));
                    return (
                      <Link
                        key={it.href}
                        href={it.href}
                        className={cn(
                          "px-4 py-2 text-sm rounded-full transition-colors",
                          active
                            ? "bg-white/[0.12] text-white shadow-inner"
                            : "text-white/80 hover:text-white hover:bg-white/[0.08]"
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        {it.label}
                      </Link>
                    );
                  })}
                </nav>
              ) : null}

              {actions ? (
                <div className="hidden sm:flex items-center gap-1 pl-1">
                  {actions}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
