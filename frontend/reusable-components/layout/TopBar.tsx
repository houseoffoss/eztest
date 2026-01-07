'use client';

import React, { ReactNode, useState } from "react"
import { Breadcrumbs, type BreadcrumbItem } from "@/frontend/reusable-components/layout/Breadcrumbs"
import { ButtonDestructive } from "@/frontend/reusable-elements/buttons/ButtonDestructive"
import { signOut } from "next-auth/react"
import { LogOut } from 'lucide-react'
import { BaseConfirmDialog } from '@/frontend/reusable-components/dialogs/BaseConfirmDialog'
import { clearAllPersistedForms } from '@/hooks/useFormPersistence'

export interface TopBarProps {
  breadcrumbs: BreadcrumbItem[]
  actions?: ReactNode
  className?: string
}

export function TopBar({ breadcrumbs, actions, className = "" }: TopBarProps) {
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);

  const handleSignOut = async () => {
    // Clear all persisted form data before signing out
    clearAllPersistedForms();
    // Clear project context from session storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('lastProjectId');
      // Clear any other project-related session data
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('defects-filters-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    await signOut({ callbackUrl: '/auth/login', redirect: true });
  };

  return (
    <div className={`sticky top-0 z-40 backdrop-blur-xl border-b border-white/10 ${className}`}>
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          <div className="min-w-0 flex-1 overflow-hidden">
            <Breadcrumbs items={breadcrumbs} />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap flex-shrink-0">
            {actions}
            <ButtonDestructive 
              type="button" 
              size="default" 
              className="px-5 cursor-pointer flex-shrink-0"
              onClick={() => setSignOutDialogOpen(true)}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </ButtonDestructive>
            
            <BaseConfirmDialog
              title="Sign Out"
              description="Are you sure you want to sign out? You will need to log in again to access your account."
              submitLabel="Sign Out"
              cancelLabel="Cancel"
              triggerOpen={signOutDialogOpen}
              onOpenChange={setSignOutDialogOpen}
              onSubmit={handleSignOut}
              destructive={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

