'use client';

import React, { ReactNode } from "react"
import { Breadcrumbs, type BreadcrumbItem } from "@/components/design"
import { ButtonDestructive } from "@/elements/button-destructive"
import { signOut } from "next-auth/react"
import { LogOut } from 'lucide-react'
import { ConfirmDialog } from '@/components/design/ConfirmDialog'

export interface TopBarProps {
  breadcrumbs: BreadcrumbItem[]
  actions?: ReactNode
  className?: string
}

export function TopBar({ breadcrumbs, actions, className = "" }: TopBarProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login', redirect: true });
  };

  return (
    <div className={`sticky top-0 z-40 backdrop-blur-xl border-b border-white/10 ${className}`}>
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          <Breadcrumbs items={breadcrumbs} />
          <div className="flex items-center gap-3">
            {actions}
            <ConfirmDialog
              title="Sign Out"
              description="Are you sure you want to sign out? You will need to log in again to access your account."
              confirmLabel={
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </>
              }
              cancelLabel="Cancel"
              onConfirm={handleSignOut}
              variant="glass"
            >
              <ButtonDestructive 
                type="button" 
                size="default" 
                className="px-5 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </ButtonDestructive>
            </ConfirmDialog>
          </div>
        </div>
      </div>
    </div>
  )
}
