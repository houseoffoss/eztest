'use client';

import { ButtonDestructive } from '@/frontend/reusable-elements/buttons/ButtonDestructive';
import { LogOut } from 'lucide-react';
import { clearAllPersistedForms } from '@/hooks/useFormPersistence';

export function ProfileHeader() {
  const handleSignOut = () => {
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
    // Let the form submit naturally to /api/auth/signout
  };

  return (
    <div className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10 mb-8 -m-6 md:-m-8 px-6 md:px-8 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-white">Account Settings</h1>
          <p className="text-white/60 text-sm mt-1">Manage your profile and preferences</p>
        </div>
        <form action="/api/auth/signout" method="POST" onSubmit={handleSignOut}>
          <ButtonDestructive type="submit" size="default" className="px-5">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </ButtonDestructive>
        </form>
      </div>
    </div>
  );
}
