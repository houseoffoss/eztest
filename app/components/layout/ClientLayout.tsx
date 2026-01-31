'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sidebar } from '@/frontend/reusable-components/layout/Sidebar';
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

  // Clear session storage when user changes (different user logs in)
  useEffect(() => {
    if (session?.user?.email && typeof window !== 'undefined') {
      const storedUserId = sessionStorage.getItem('currentUserId');
      const currentUserId = session.user.email; // Using email as unique identifier
      
      if (storedUserId && storedUserId !== currentUserId) {
        // Different user logged in - clear all project context
        sessionStorage.removeItem('lastProjectId');
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('defects-filters-')) {
            sessionStorage.removeItem(key);
          }
        });
        setLastProjectId(null);
      }
      
      // Store current user identifier
      sessionStorage.setItem('currentUserId', currentUserId);
    } else if (!session && typeof window !== 'undefined') {
      // User logged out - clear all session storage
      sessionStorage.clear();
    }
  }, [session]);

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
    } else if (pathname === '/projects' || pathname?.startsWith('/testcases') || pathname?.startsWith('/testruns')) {
      // Projects list, test cases, test runs pages
      // Keep last project context in sidebar if available
      if (lastProjectId) {
        setProjectId(lastProjectId);
        setSidebarItems(getProjectSidebarItems(lastProjectId, isAdmin, canManageSettings));
      } else {
        setSidebarItems(pathname === '/projects' ? getProjectsPageSidebarItems(isAdmin) : mainSidebarItems);
        setProjectId(null);
      }
    } else if (pathname?.startsWith('/settings') || pathname?.startsWith('/profile')) {
      // Settings or profile pages - show admin menu for admin users
      if (isAdmin) {
        setSidebarItems(getAdminSidebarItems());
      } else if (lastProjectId) {
        setProjectId(lastProjectId);
        setSidebarItems(getProjectSidebarItems(lastProjectId, isAdmin, canManageSettings));
      } else {
        setSidebarItems(mainSidebarItems);
      }
      setProjectId(null);
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
