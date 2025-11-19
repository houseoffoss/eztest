'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/design/Sidebar';
import { mainSidebarItems, getProjectSidebarItems, getProjectsPageSidebarItems } from '@/lib/sidebar-config';
import { useEffect, useState } from 'react';
import { useSidebarCollapsed } from '@/lib/sidebar-context';

interface ClientLayoutProps {
  children: React.ReactNode;
}

/**
 * Client-side layout wrapper that automatically adds sidebar to authenticated pages
 */
export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const [sidebarItems, setSidebarItems] = useState(mainSidebarItems);
  const [projectId, setProjectId] = useState<string | null>(null);
  const { isCollapsed } = useSidebarCollapsed();

  // Auth pages that shouldn't have sidebar
  const isAuthPage = pathname?.startsWith('/auth');
  const showSidebar = !isAuthPage;

  useEffect(() => {
    // Determine which sidebar items to show based on current path
    if (pathname === '/projects') {
      // Projects list page - show projects menu
      setSidebarItems(getProjectsPageSidebarItems());
      setProjectId(null);
    } else if (pathname?.startsWith('/projects/')) {
      // Project detail page - extract project ID and show project menu
      const projectIdMatch = pathname.match(/\/projects\/([^\/]+)/);
      if (projectIdMatch && projectIdMatch[1]) {
        const extractedProjectId = projectIdMatch[1];
        setProjectId(extractedProjectId);
        setSidebarItems(getProjectSidebarItems(extractedProjectId));
      } else {
        setSidebarItems(mainSidebarItems);
        setProjectId(null);
      }
    } else {
      setSidebarItems(mainSidebarItems);
      setProjectId(null);
    }
  }, [pathname]);

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
