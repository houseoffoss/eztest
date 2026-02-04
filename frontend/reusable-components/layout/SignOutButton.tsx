'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { ButtonDestructive } from '@/frontend/reusable-elements/buttons/ButtonDestructive';
import { BaseConfirmDialog } from '@/frontend/reusable-components/dialogs/BaseConfirmDialog';
import { clearAllPersistedForms } from '@/hooks/useFormPersistence';

export interface SignOutButtonProps {
  /**
   * Size of the button
   * @default 'default'
   */
  size?: 'default' | 'sm' | 'lg';
  
  /**
   * Whether to show a confirmation dialog before signing out
   * @default true
   */
  showConfirmation?: boolean;
  
  /**
   * Additional CSS classes for the button
   */
  className?: string;
  
  /**
   * Button name for tracking/logging purposes
   */
  buttonName?: string;
  
  /**
   * Optional custom label
   * @default 'Sign Out'
   */
  label?: string;
}

/**
 * SignOutButton Component
 * 
 * A reusable sign-out button component that handles:
 * - Clearing persisted form data
 * - Clearing session storage (project context, filters)
 * - Optional confirmation dialog
 * - Safe async sign-out with proper cleanup
 * 
 * @example
 * ```tsx
 * // Simple usage in Navbar actions
 * <SignOutButton />
 * 
 * // With custom label
 * <SignOutButton label="Logout" />
 * 
 * // Without confirmation dialog
 * <SignOutButton showConfirmation={false} />
 * 
 * // In actions array
 * actions={
 *   <div className="flex items-center gap-2">
 *     <OtherButton />
 *     <SignOutButton size="default" className="px-5" />
 *   </div>
 * }
 * ```
 */
export function SignOutButton({
  size = 'default',
  showConfirmation = true,
  className,
  buttonName = 'Sign Out Button',
  label = 'Sign Out',
}: SignOutButtonProps) {
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
    
    // Sign out and redirect to login
    await signOut({ callbackUrl: '/auth/login', redirect: true });
  };

  // If no confirmation is needed, render button directly
  if (!showConfirmation) {
    return (
      <ButtonDestructive
        type="button"
        size={size}
        className={className}
        onClick={handleSignOut}
        buttonName={buttonName}
      >
        <LogOut className="w-4 h-4 mr-2" />
        {label}
      </ButtonDestructive>
    );
  }

  // With confirmation dialog
  return (
    <>
      <ButtonDestructive
        type="button"
        size={size}
        className={className}
        onClick={() => setSignOutDialogOpen(true)}
        buttonName={buttonName}
      >
        <LogOut className="w-4 h-4 mr-2" />
        {label}
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
    </>
  );
}

export default SignOutButton;

