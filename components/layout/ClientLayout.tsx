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
  const [lastProjectId, setLastProjectId] = useState<string | null>(() => {
    // Initialize from sessionStorage on mount
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('lastProjectId');
    }
    return null;
  });
  const { isCollapsed } = useSidebarCollapsed();

  // Pages that shouldn't have sidebar
  const isAuthPage = pathname?.startsWith('/auth');
  const isHomePage = pathname === '/';
  const isPrivacyPage = pathname === '/privacy';
  const showSidebar = !isAuthPage && !isHomePage && !isPrivacyPage;

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
      setLastProjectId(null);
      // Clear project context when going to admin
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('lastProjectId');
      }
    } else if (pathname?.startsWith('/projects/')) {
      // Project detail page - extract project ID and show project menu with admin items if applicable
      const projectIdMatch = pathname.match(/\/projects\/([^\/]+)/);
      if (projectIdMatch && projectIdMatch[1]) {
        const extractedProjectId = projectIdMatch[1];
        setProjectId(extractedProjectId);
        setLastProjectId(extractedProjectId);
        setSidebarItems(getProjectSidebarItems(extractedProjectId, isAdmin, canManageSettings));
        // Store project ID in sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('lastProjectId', extractedProjectId);
        }
      } else {
        setSidebarItems(mainSidebarItems);
      }
    } else if (pathname === '/projects' || pathname?.startsWith('/testcases') || pathname?.startsWith('/testruns') || pathname?.startsWith('/settings') || pathname?.startsWith('/profile')) {
      // Projects list, test cases, test runs, settings, or profile pages
      // Keep last project context in sidebar if available
      if (lastProjectId) {
        setProjectId(lastProjectId);
        setSidebarItems(getProjectSidebarItems(lastProjectId, isAdmin, canManageSettings));
      } else {
        setSidebarItems(pathname === '/projects' ? getProjectsPageSidebarItems(isAdmin) : mainSidebarItems);
        setProjectId(null);
      }
    } else {
      // Other main pages - show main items with admin items if applicable
      if (isAdmin) {
        setSidebarItems(getAdminSidebarItems());
      } else {
        setSidebarItems(mainSidebarItems);
      }
      setProjectId(null);
    }
  }, [pathname, isAdmin, canManageSettings, lastProjectId]);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar items={sidebarItems} projectId={projectId || undefined} />
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-60'}`}>
        {children}
      </div>
    </div>
  );
}
