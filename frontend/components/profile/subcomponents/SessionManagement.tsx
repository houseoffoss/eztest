import { Badge } from '@/elements/badge';
import { ButtonDestructive } from '@/elements/button-destructive';
import { GlassPanel } from '@/components/design/GlassPanel';
import { LogOut } from 'lucide-react';
import { clearAllPersistedForms } from '@/hooks/useFormPersistence';

export function SessionManagement() {
  const handleSignOutAll = () => {
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
    // Additional logic for signing out all sessions would go here
  };

  return (
    <GlassPanel heading="Session Management" contentClassName="space-y-4">
      <div className="space-y-3">
        <div className="p-3 rounded-lg border border-white/10 bg-white/5">
          <div className="text-white font-medium mb-2">Active Sessions: 2</div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/70">This Browser</span>
              <Badge variant="glass-success" className="rounded-full text-xs">Current</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Safari on iPhone</span>
              <Badge variant="glass" className="rounded-full text-xs cursor-pointer hover:bg-white/15">Remove</Badge>
            </div>
          </div>
        </div>
        <ButtonDestructive className="w-full rounded-lg" onClick={handleSignOutAll}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out All Sessions
        </ButtonDestructive>
      </div>
    </GlassPanel>
  );
}
