import React, { ReactNode } from "react"
import { Breadcrumbs, type BreadcrumbItem } from "@/components/design"
import { Button } from "@/elements/button"

export interface TopBarProps {
  breadcrumbs: BreadcrumbItem[]
  actions?: ReactNode
  className?: string
}

export function TopBar({ breadcrumbs, actions, className = "" }: TopBarProps) {
  return (
    <div className={`sticky top-0 z-40 backdrop-blur-xl border-b border-white/10 ${className}`}>
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          <Breadcrumbs items={breadcrumbs} />
          <div className="flex items-center gap-3">
            {actions}
            <form action="/api/auth/signout" method="POST" className="inline">
              <Button type="submit" variant="glass-destructive" size="default" className="px-5">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
