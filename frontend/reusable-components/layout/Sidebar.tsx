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
  Bug,
} from 'lucide-react';
import { Button } from '@/frontend/reusable-elements/buttons/Button';

export interface SidebarItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: SidebarItem[];
  count?: number;
  badge?: string;
  section?: string; // Section header for grouping
}

export interface SidebarProps {
  items: SidebarItem[];
  projectId?: string;
  className?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  Dashboard: <LayoutDashboard className="w-4 h-4" />,
  Overview: <LayoutDashboard className="w-4 h-4" />,
  'Test Plans': <ClipboardList className="w-4 h-4" />,
  Projects: <Folder className="w-4 h-4" />,
  'Test Suites': <FolderTree className="w-4 h-4" />,
  'Test Cases': <FileCheck className="w-4 h-4" />,
  'Test Runs': <PlayCircle className="w-4 h-4" />,
  Defects: <Bug className="w-4 h-4" />,
  Members: <Users className="w-4 h-4" />,
  Settings: <Settings className="w-4 h-4" />,
  Admin: <Shield className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  // 日本語ラベル
  プロジェクト: <Folder className="w-4 h-4" />,
  テストスイート: <FolderTree className="w-4 h-4" />,
  テストケース: <FileCheck className="w-4 h-4" />,
  テストラン: <PlayCircle className="w-4 h-4" />,
  Defect: <Bug className="w-4 h-4" />,
  メンバー: <Users className="w-4 h-4" />,
  設定: <Settings className="w-4 h-4" />,
  管理: <Shield className="w-4 h-4" />,
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

  // Fetch project name and handle deleted projects
  React.useEffect(() => {
    if (projectId) {
      const fetchProjectName = async () => {
        try {
          const response = await fetch(`/api/projects/${projectId}`);
          if (response.ok) {
            const data = await response.json();
            setProjectName(data.data?.name || null);
          } else if (response.status === 404 || response.status === 403) {
            // Project was deleted, not found, or no access
            setProjectName('プロジェクトがありません');
            
            // Redirect to projects page after a brief moment
            if (typeof window !== 'undefined' && window.location.pathname.includes(`/projects/${projectId}`)) {
              setTimeout(() => {
                window.location.href = '/projects';
              }, 1500);
            }
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
      if (item.label === 'テストスイート') {
        return {
          ...item,
          children: testSuites.length > 0 ? testSuites.map(suite => ({
            label: suite.name,
            href: `/projects/${projectId}/testsuites/${suite.id}`,
          })) : [], // Keep as empty array if no data, but item will still be treated as expandable
        };
      }
      if (item.label === 'テストラン') {
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
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.08]'
              )}
            >
              {icon && (
                <span className={cn('shrink-0', isActive ? 'text-white' : 'text-white/60')}>
                  {icon}
                </span>
              )}
              {item.count !== undefined && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-500 text-white min-w-[20px] text-center">
                  {item.count}
                </span>
              )}
              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-3 py-2 bg-[#0b1028]/95 backdrop-blur-xl border border-white/10 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                {item.label}
              </span>
            </Link>
          ) : (
            <button
              className={cn(
              'w-full flex items-center justify-center p-3 rounded-lg transition-all relative group',
              'text-white/60 hover:text-white hover:bg-white/[0.08]'
              )}
            >
              {icon && <span className="shrink-0 text-white/60">{icon}</span>}
              {item.count !== undefined && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-500 text-white min-w-[20px] text-center">
                  {item.count}
                </span>
              )}
              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-3 py-2 bg-[#0b1028]/95 backdrop-blur-xl border border-white/10 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
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
              'flex items-center justify-between gap-3 px-3 py-2 rounded-md transition-all group',
              level > 0 && 'pl-10',
              isActive
                ? 'bg-white/[0.08] text-white'
                : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
            )}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {icon && (
                <span className={cn('shrink-0', isActive ? 'text-white' : 'text-white/70')}>
                  {icon}
                </span>
              )}
              <span className="text-sm font-normal truncate">{item.label}</span>
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
                'flex-1 flex items-center gap-3 px-3 py-2 rounded-l-md transition-all',
                level > 0 && 'pl-10',
                isActive
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {icon && (
                  <span className={cn('shrink-0', isActive ? 'text-white' : 'text-white/70')}>
                    {icon}
                  </span>
                )}
                <span className="text-sm font-normal truncate">{item.label}</span>
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
                'flex items-center px-3 py-2 rounded-r-md transition-all cursor-pointer',
                isActive
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
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
              'w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md transition-all text-left cursor-pointer',
              level > 0 && 'pl-10',
              'text-white/70 hover:text-white hover:bg-white/[0.05]'
            )}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {icon && <span className="shrink-0 text-white/70">{icon}</span>}
              <span className="text-sm font-normal truncate">{item.label}</span>
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

  const gradientStyle = 'conic-gradient(from 45deg, rgba(255, 255, 255, 0.1) 0deg, rgba(255, 255, 255, 0.4) 90deg, rgba(255, 255, 255, 0.1) 180deg, rgba(255, 255, 255, 0.4) 270deg, rgba(255, 255, 255, 0.1) 360deg)';

  return (
    <div
      className={cn(
        'fixed left-2 top-2 bottom-2 h-auto rounded-3xl p-[0.5px] transition-all duration-300',
        isMounted && isCollapsed ? 'w-16' : 'w-56',
        className
      )}
      style={{
        background: gradientStyle,
      }}
    >
      <aside
        className="h-full relative overflow-hidden flex flex-col rounded-3xl"
        style={{ backgroundColor: '#0a1628' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-white/[0.02] backdrop-blur-2xl border border-white/10 shadow-lg shadow-black/30 before:content-[''] before:absolute before:inset-0 before:rounded-[inherit] before:pointer-events-none before:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.005),rgba(255,255,255,0.02))] pointer-events-none" />
        <div className={cn(
          'relative z-10 h-full flex flex-col',
          isMounted && isCollapsed ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'
        )}>
      {/* Logo */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-2">
        {!isCollapsed ? (
          <>
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <span className="text-2xl">🧪</span>
              <span className="text-xl font-bold text-white">EZTest</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="text-white/40 hover:text-white hover:bg-white/5 p-1.5 shrink-0 rounded-md"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full">
            <Link href="/" className="flex items-center justify-center hover:opacity-80 transition-opacity">
              <span className="text-2xl">🧪</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="text-white/40 hover:text-white hover:bg-white/5 p-1.5 w-full rounded-md"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Project Indicator - Show when on project page */}
      {projectId && items.some(item => item.label === 'Test Suites') && (
        <div className={cn(
          'px-3 py-2 mb-1',
          isCollapsed && 'px-2'
        )}>
          {projectName === 'Project Undefined' ? (
            // Show warning state for undefined project
            !isCollapsed ? (
              <div className="flex flex-col gap-2 px-3 py-2 rounded-md bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-sm font-normal text-red-400 truncate">
                    Project Undefined
                  </span>
                </div>
                <p className="text-xs text-red-300/80">
                  Redirecting to projects...
                </p>
              </div>
            ) : (
              <div 
                className="flex items-center justify-center p-2.5 rounded-md bg-red-500/10 border border-red-500/30"
                title="Project Undefined - Redirecting..."
              >
                <Folder className="w-4 h-4 text-red-400" />
              </div>
            )
          ) : (
            // Normal project indicator
            !isCollapsed ? (
              <Link 
                href={`/projects/${projectId}`}
                className="flex items-center gap-3 px-3 py-2 rounded-md bg-white/[0.04] hover:bg-white/[0.06] transition-all group"
                title={projectName || projectId}
              >
                <Folder className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm font-normal text-white/90 truncate">
                  {projectName || `Project ${projectId.slice(0, 6)}...`}
                </span>
              </Link>
            ) : (
              <Link 
                href={`/projects/${projectId}`}
                className="flex items-center justify-center p-2.5 rounded-md bg-white/[0.04] hover:bg-white/[0.06] transition-all"
                title={projectName || projectId}
              >
                <Folder className="w-4 h-4 text-primary" />
              </Link>
            )
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className={cn('px-3 py-2 space-y-0.5', isMounted && isCollapsed && 'px-2')}>
        {displayItems.map((item, index) => renderItem(item, 0, index))}
      </nav>

      {/* User Account Section - Spacer to push to bottom */}
      <div className="flex-1" />

      {/* User Account Section - Bottom */}
      <div className={cn('border-t border-white/[0.08] px-3 py-4', isMounted && isCollapsed && 'px-2')}>
        <Link
          href="/settings/profile"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md transition-all',
            isMounted && isCollapsed ? 'justify-center' : 'justify-start',
            'text-white/70 hover:text-white hover:bg-white/[0.05]'
          )}
          title={isMounted && isCollapsed ? 'アカウント' : ''}
        >
          {isMounted && isCollapsed ? (
            <Settings className="w-5 h-5" />
          ) : (
            <>
              <Settings className="w-5 h-5" />
              <span className="text-sm font-normal">アカウント</span>
            </>
          )}
        </Link>
      </div>
        </div>
      </aside>
    </div>
  );
}

