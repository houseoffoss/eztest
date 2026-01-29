'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User, Lock } from 'lucide-react';
import { SignOutButton } from '@/frontend/reusable-components/layout/SignOutButton';

export interface SettingsSidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const SETTINGS_ITEMS: SettingsSidebarItem[] = [
  {
    label: 'Profile',
    href: '/settings/profile',
    icon: <User className="w-4 h-4" />,
  },
  {
    label: 'Account & Security',
    href: '/settings/account',
    icon: <Lock className="w-4 h-4" />,
  },
];

interface SettingsSidebarProps {
  className?: string;
}

export function SettingsSidebar({ className }: SettingsSidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn('w-48 bg-white/[0.02] border-r border-white/10 flex-shrink-0 flex flex-col', className)}>
      <nav className="space-y-1 p-4 flex-1">
        {SETTINGS_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium',
                isActive
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              )}
            >
              {item.icon && (
                <span className={cn('shrink-0', isActive ? 'text-blue-400' : 'text-white/60')}>
                  {item.icon}
                </span>
              )}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Sign Out Button at Bottom */}
      <div className="p-4 border-t border-white/10">
        <SignOutButton 
          size="sm" 
          className="w-full px-4 flex items-center justify-center gap-2"
          showConfirmation={true}
        />
      </div>
    </div>
  );
}
