import { SidebarItem } from '@/components/design/Sidebar';

/**
 * Main navigation items for the application
 */
export const mainSidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    label: 'Projects',
    href: '/projects',
  },
];

/**
 * Generate project-specific sidebar items
 */
export const getProjectSidebarItems = (projectId: string): SidebarItem[] => [
  {
    label: 'Projects',
    href: '/projects',
  },
  {
    label: 'Test Suites',
    href: `/projects/${projectId}/testsuites`,
    children: [], // Will be populated dynamically
  },
  {
    label: 'Test Cases',
    href: `/projects/${projectId}/testcases`,
  },
  {
    label: 'Test Plans',
    href: `/projects/${projectId}/testplans`,
  },
  {
    label: 'Test Runs',
    href: `/projects/${projectId}/testruns`,
    children: [], // Will be populated dynamically
  },
  {
    label: 'Members',
    href: `/projects/${projectId}/members`,
  },
  {
    label: 'Settings',
    href: `/projects/${projectId}/settings`,
  },
];

/**
 * Sidebar items for projects list page (without specific project)
 */
export const getProjectsPageSidebarItems = (): SidebarItem[] => [
  {
    label: 'Projects',
    href: '/projects',
  },
  {
    label: 'Test Suites',
    children: [],
  },
  {
    label: 'Test Cases',
    href: '#',
  },
  {
    label: 'Test Plans',
    href: '#',
  },
  {
    label: 'Test Runs',
    children: [],
  },
  {
    label: 'Members',
    href: '#',
  },
  {
    label: 'Settings',
    href: '#',
  },
];
