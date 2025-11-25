'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebarCollapsed } from '@/lib/sidebar-context';
import { useTestSuites, useTestRuns } from '@/hooks/useSidebarData';
import {
  LayoutDashboard,
  FolderTree,
  FileCheck,
  ClipboardList,
  PlayCircle,
  Users,
  Settings,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Folder,
  Shield,
} from 'lucide-react';
import { Button } from '@/elements/button';

export interface SidebarItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: SidebarItem[];
  count?: number;
  badge?: string;
}

export interface SidebarProps {
  items: SidebarItem[];
  projectId?: string;
  className?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  Dashboard: <LayoutDashboard className="w-4 h-4" />,
  Projects: <Folder className="w-4 h-4" />,
  Overview: <LayoutDashboard className="w-4 h-4" />,
  'Test Suites': <FolderTree className="w-4 h-4" />,
  'Test Cases': <FileCheck className="w-4 h-4" />,
  'Test Plans': <ClipboardList className="w-4 h-4" />,
  'Test Runs': <PlayCircle className="w-4 h-4" />,
  Members: <Users className="w-4 h-4" />,
  Settings: <Settings className="w-4 h-4" />,
  Admin: <Shield className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
};

export function Sidebar({ items, projectId, className }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [displayItems, setDisplayItems] = React.useState(items);
  const [projectName, setProjectName] = React.useState<string | null>(null);
  const { setIsCollapsed: setContextCollapsed } = useSidebarCollapsed();
  const { testSuites } = useTestSuites(projectId || '');
  const { testRuns } = useTestRuns(projectId || '');

  // Handle client-side mounting
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch project name
  React.useEffect(() => {
    if (projectId) {
      const fetchProjectName = async () => {
        try {
          const response = await fetch(`/api/projects/${projectId}`);
          if (response.ok) {
            const data = await response.json();
            setProjectName(data.data?.name || null);
          } else if (response.status === 404) {
            // Project was deleted or not found
            setProjectName(null);
          }
        } catch (error) {
          console.error('Failed to fetch project name:', error);
          setProjectName(null);
        }
      };
      fetchProjectName();
    } else {
      setProjectName(null);
    }
  }, [projectId]);

  // Update display items when test suites or test runs change
  React.useEffect(() => {
    const updatedItems = items.map(item => {
      if (item.label === 'Test Suites') {
        return {
          ...item,
          children: testSuites.length > 0 ? testSuites.map(suite => ({
            label: suite.name,
            href: `/projects/${projectId}/testsuites/${suite.id}`,
          })) : [], // Keep as empty array if no data, but item will still be treated as expandable
        };
      }
      if (item.label === 'Test Runs') {
        return {
          ...item,
          children: testRuns.length > 0 ? testRuns.map(run => ({
            label: run.name,
            href: `/projects/${projectId}/testruns/${run.id}`,
          })) : [], // Keep as empty array if no data, but item will still be treated as expandable
        };
      }
      return item;
    });
    setDisplayItems(updatedItems);
  }, [testSuites, testRuns, items, projectId]);

  const toggleExpanded = (label: string) => {
    if (isCollapsed) return; // Don't expand when sidebar is collapsed
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    setContextCollapsed(newCollapsedState);
    if (!newCollapsedState) {
      setExpandedItems(new Set()); // Collapse all items when sidebar collapses
    }
  };

  const renderItem = (item: SidebarItem, level = 0, index = 0) => {
    const hasChildren = item.children !== undefined && item.children !== null;
    const isExpanded = expandedItems.has(item.label);
    const isActive = item.href ? pathname === item.href : false;
    const icon = item.icon || iconMap[item.label];
    const uniqueKey = `${level}-${index}-${item.label}-${item.href || 'no-href'}`;

    if (isMounted && isCollapsed && level === 0) {
      // Collapsed view - only show icons
      return (
        <div key={uniqueKey} title={item.label}>
          {item.href ? (
            <Link
              href={item.href}
              className={cn(
                'flex items-center justify-center p-3 rounded-lg transition-all relative group',
                isActive
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              )}
            >
              {icon && (
                <span className={cn('shrink-0', isActive ? 'text-blue-400' : 'text-white/60')}>
                  {icon}
                </span>
              )}
              {item.count !== undefined && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-500 text-white min-w-[20px] text-center">
                  {item.count}
                </span>
              )}
              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-3 py-2 bg-[#1a2332] text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                {item.label}
              </span>
            </Link>
          ) : (
            <button
              className={cn(
                'w-full flex items-center justify-center p-3 rounded-lg transition-all relative group',
                'text-white/70 hover:text-white hover:bg-white/5'
              )}
            >
              {icon && <span className="shrink-0 text-white/60">{icon}</span>}
              {item.count !== undefined && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-500 text-white min-w-[20px] text-center">
                  {item.count}
                </span>
              )}
              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-3 py-2 bg-[#1a2332] text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                {item.label}
              </span>
            </button>
          )}
        </div>
      );
    }

    // Expanded view - show full details
    return (
      <div key={uniqueKey}>
        {item.href && !hasChildren ? (
          // Simple link without children
          <Link
            href={item.href}
            className={cn(
              'flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg transition-all group',
              level > 0 && 'pl-10',
              isActive
                ? 'bg-blue-500/20 text-blue-400 border-l-2 border-blue-500'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            )}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {icon && (
                <span className={cn('shrink-0', isActive ? 'text-blue-400' : 'text-white/60')}>
                  {icon}
                </span>
              )}
              <span className="text-sm font-medium truncate">{item.label}</span>
            </div>
            {item.count !== undefined && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-white/70">
                {item.count}
              </span>
            )}
            {item.badge && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400">
                {item.badge}
              </span>
            )}
          </Link>
        ) : item.href && hasChildren ? (
          // Link with children (hybrid: navigate on text, dropdown on chevron)
          <div className="flex items-center gap-0 rounded-lg group">
            <Link
              href={item.href}
              className={cn(
                'flex-1 flex items-center gap-3 px-4 py-2.5 rounded-l-lg transition-all',
                level > 0 && 'pl-10',
                isActive
                  ? 'bg-blue-500/20 text-blue-400 border-l-2 border-blue-500'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {icon && (
                  <span className={cn('shrink-0', isActive ? 'text-blue-400' : 'text-white/60')}>
                    {icon}
                  </span>
                )}
                <span className="text-sm font-medium truncate">{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-white/70">
                  {item.count}
                </span>
              )}
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(item.label);
              }}
              className={cn(
                'flex items-center px-3 py-2.5 rounded-r-lg transition-all',
                isActive
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              )}
              title="Toggle dropdown"
            >
              <span className="text-white/40">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </span>
            </button>
          </div>
        ) : (
          // Button without href (dropdown only)
          <button
            onClick={() => hasChildren && toggleExpanded(item.label)}
            className={cn(
              'w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg transition-all text-left',
              level > 0 && 'pl-10',
              'text-white/70 hover:text-white hover:bg-white/5'
            )}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {icon && <span className="shrink-0 text-white/60">{icon}</span>}
              <span className="text-sm font-medium truncate">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.count !== undefined && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-white/70">
                  {item.count}
                </span>
              )}
              {hasChildren && (
                <span className="text-white/40">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </span>
              )}
            </div>
          </button>
        )}
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children && item.children.length > 0 ? (
              item.children.map((child, childIndex) => renderItem(child, level + 1, childIndex))
            ) : (
              <div className="px-4 py-2 text-sm text-white/40 italic">No items</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-[#0f1623] border-r border-white/10 overflow-y-auto transition-all duration-300 flex flex-col',
        isMounted && isCollapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      {/* Logo & Toggle */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between gap-2">
        {!isCollapsed ? (
          <>
            <Link href="/" className="flex items-center gap-3">
              <span className="text-2xl">🧪</span>
              <span className="text-xl font-bold text-white">EZTest</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="text-white/70 hover:text-white hover:bg-blue-500/20 p-2 shrink-0"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full">
            <Link href="/" className="flex items-center justify-center">
              <span className="text-2xl">🧪</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="text-white/70 hover:text-white hover:bg-blue-500/20 p-2 w-full"
              title="Expand sidebar"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Project Indicator - Show when on project page */}
      {projectId && items.some(item => item.label === 'Test Suites') && (
        <div className={cn(
          'px-4 py-3 border-b border-white/[0.08]',
          isCollapsed && 'px-2'
        )}>
          {!isCollapsed ? (
            <>
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">Current Project</div>
              <Link 
                href={`/projects/${projectId}`}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/15 border border-primary/30 hover:bg-primary/20 hover:border-primary/40 transition-all group"
                title={projectName || projectId}
              >
                <Folder className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-primary truncate group-hover:text-primary/90">
                  {projectName || `Project ${projectId.slice(0, 6)}...`}
                </span>
              </Link>
            </>
          ) : (
            <Link 
              href={`/projects/${projectId}`}
              className="flex items-center justify-center p-2 rounded-md bg-primary/15 border border-primary/30 hover:bg-primary/20 hover:border-primary/40 transition-all"
              title={projectName || projectId}
            >
              <Folder className="w-4 h-4 text-primary" />
            </Link>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className={cn('p-4 space-y-1', isMounted && isCollapsed && 'px-2')}>
        {displayItems.map((item, index) => renderItem(item, 0, index))}
      </nav>

      {/* User Account Section - Spacer to push to bottom */}
      <div className="flex-1" />

      {/* User Account Section - Bottom */}
      <div className={cn('border-t border-white/10 p-4', isMounted && isCollapsed && 'px-2')}>
        <Link
          href="/settings/profile"
          className={cn(
            'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all',
            isMounted && isCollapsed ? 'justify-center' : 'justify-start',
            'text-white/70 hover:text-white hover:bg-white/5'
          )}
          title={isMounted && isCollapsed ? 'Account' : ''}
        >
          {isMounted && isCollapsed ? (
            <Settings className="w-4 h-4" />
          ) : (
            <>
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Account</span>
            </>
          )}
        </Link>
      </div>
    </aside>
  );
}
