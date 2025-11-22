'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sidebar } from '@/components/design/Sidebar';
import { mainSidebarItems, getProjectSidebarItems, getProjectsPageSidebarItems, getAdminSidebarItems } from '@/lib/sidebar-config';
import { useEffect, useState, useMemo } from 'react';
import { useSidebarCollapsed } from '@/lib/sidebar-context';

interface ClientLayoutProps {
  children: React.ReactNode;
}

/**
 * Client-side layout wrapper that automatically adds sidebar to authenticated pages
 */
export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarItems, setSidebarItems] = useState(mainSidebarItems);
  const [projectId, setProjectId] = useState<string | null>(null);
  const { isCollapsed } = useSidebarCollapsed();

  // Pages that shouldn't have sidebar
  const isAuthPage = pathname?.startsWith('/auth');
  const isHomePage = pathname === '/';
  const showSidebar = !isAuthPage && !isHomePage;

  // Check if user is admin
  const isAdmin = session?.user?.roleName === 'ADMIN';
  
  // Check if user can manage settings (ADMIN, PROJECT_MANAGER, or has testruns:update permission)
  const canManageSettings = useMemo(() => 
    isAdmin || 
    session?.user?.permissions?.includes('testruns:update') ||
    session?.user?.permissions?.includes('users:manage'),
    [isAdmin, session?.user?.permissions]
  );

  useEffect(() => {
    // Determine which sidebar items to show based on current path
    if (pathname?.startsWith('/admin')) {
      // Admin pages - show admin menu
      setSidebarItems(getAdminSidebarItems());
      setProjectId(null);
    } else if (pathname === '/projects') {
      // Projects list page - show projects menu with admin items if applicable
      setSidebarItems(getProjectsPageSidebarItems(isAdmin));
      setProjectId(null);
    } else if (pathname?.startsWith('/projects/')) {
      // Project detail page - extract project ID and show project menu with admin items if applicable
      const projectIdMatch = pathname.match(/\/projects\/([^\/]+)/);
      if (projectIdMatch && projectIdMatch[1]) {
        const extractedProjectId = projectIdMatch[1];
        setProjectId(extractedProjectId);
        setSidebarItems(getProjectSidebarItems(extractedProjectId, isAdmin, canManageSettings));
      } else {
        setSidebarItems(mainSidebarItems);
        setProjectId(null);
      }
    } else {
      // Main pages (including settings/profile) - show main items with admin items if applicable
      if (isAdmin) {
        setSidebarItems(getAdminSidebarItems());
      } else {
        setSidebarItems(mainSidebarItems);
      }
      setProjectId(null);
    }
  }, [pathname, isAdmin]);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar items={sidebarItems} projectId={projectId || undefined} />
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        {children}
      </div>
    </div>
  );
}
