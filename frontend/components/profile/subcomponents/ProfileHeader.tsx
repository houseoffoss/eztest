import { ButtonDestructive } from '@/elements/button-destructive';
import { LogOut } from 'lucide-react';

export function ProfileHeader() {
  return (
    <div className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10 mb-8 -m-6 md:-m-8 px-6 md:px-8 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-white">Account Settings</h1>
          <p className="text-white/60 text-sm mt-1">Manage your profile and preferences</p>
        </div>
        <form action="/api/auth/signout" method="POST">
          <ButtonDestructive type="submit" size="default" className="px-5">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </ButtonDestructive>
        </form>
      </div>
    </div>
  );
}
