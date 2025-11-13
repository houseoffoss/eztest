"use client";

import * as React from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

type GlassFooterProps = {
  variant?: "full" | "simple";
  description?: React.ReactNode;
  className?: string;
};

export function GlassFooter({ variant = "full", description, className }: GlassFooterProps) {
  return (
    <footer className={className ? className + " mt-24" : "mt-24"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl ring-1 ring-white/5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] px-6 py-8">
          {/* subtle gradient hairline */}
          <div className="h-px bg-gradient-to-r from-primary/30 via-white/10 to-accent/30 mb-6" />

          {variant === "simple" ? (
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧪</span>
                <span className="font-semibold text-primary">EZTest</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {description ?? "UI Component Library - All components ready for use"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                {/* Brand Column */}
                <div className="space-y-4">
                  <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl">🧪</span>
                    <span className="text-xl font-bold text-primary">EZTest</span>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Self-hostable test management platform for modern teams.
                  </p>
                </div>

                {/* Product Column */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-primary">Product</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link href="/ui" className="text-muted-foreground hover:text-primary transition-colors">
                        Features
                      </Link>
                    </li>
                    <li>
                      <Link href="/auth/register" className="text-muted-foreground hover:text-primary transition-colors">
                        Pricing
                      </Link>
                    </li>
                    <li>
                      <Link href="/auth/register" className="text-muted-foreground hover:text-primary transition-colors">
                        Documentation
                      </Link>
                    </li>
                    <li>
                      <Link href="/auth/register" className="text-muted-foreground hover:text-primary transition-colors">
                        Changelog
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Resources Column */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-primary">Resources</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link href="/auth/register" className="text-muted-foreground hover:text-primary transition-colors">
                        GitHub
                      </Link>
                    </li>
                    <li>
                      <Link href="/auth/register" className="text-muted-foreground hover:text-primary transition-colors">
                        Community
                      </Link>
                    </li>
                    <li>
                      <Link href="/auth/register" className="text-muted-foreground hover:text-primary transition-colors">
                        Support
                      </Link>
                    </li>
                    <li>
                      <Link href="/auth/register" className="text-muted-foreground hover:text-primary transition-colors">
                        Status
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Company Column */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-primary">Company</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link href="/auth/register" className="text-muted-foreground hover:text-primary transition-colors">
                        About
                      </Link>
                    </li>
                    <li>
                      <Link href="/auth/register" className="text-muted-foreground hover:text-primary transition-colors">
                        Blog
                      </Link>
                    </li>
                    <li>
                      <Link href="/auth/register" className="text-muted-foreground hover:text-primary transition-colors">
                        Careers
                      </Link>
                    </li>
                    <li>
                      <Link href="/auth/register" className="text-muted-foreground hover:text-primary transition-colors">
                        Contact
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} EZTest. All rights reserved.</p>
                <div className="flex items-center gap-6 text-sm">
                  <Link href="/auth/register" className="text-muted-foreground hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                  <Link href="/auth/register" className="text-muted-foreground hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                  <Link href="/auth/register" className="text-muted-foreground hover:text-primary transition-colors">
                    License
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}

export default GlassFooter;
