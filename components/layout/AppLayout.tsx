'use client';

import { Sidebar } from '@/components/design/Sidebar';
import { Navbar } from '@/components/design/Navbar';
import { cn } from '@/lib/utils';
import { mainSidebarItems } from '@/lib/sidebar-config';
import { SidebarItem } from '@/components/design/Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  sidebarItems?: SidebarItem[];
  navbarItems?: Array<{ label: string; href: string }>;
  navbarActions?: React.ReactNode;
  showSidebar?: boolean;
  className?: string;
}

/**
 * Centralized application layout with sidebar and navbar
 */
export function AppLayout({
  children,
  sidebarItems = mainSidebarItems,
  navbarItems,
  navbarActions,
  showSidebar = true,
  className,
}: AppLayoutProps) {
  return (
        <div className="flex-1 flex flex-col">
      {showSidebar && <Sidebar items={sidebarItems} />}
      
      <div className={cn(showSidebar ? 'ml-64' : '', 'min-h-screen')}>
        {navbarItems && (
          <Navbar items={navbarItems} actions={navbarActions} />
        )}
        
        <main className={cn('w-full', className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
