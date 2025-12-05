import { SidebarItem } from '@/components/design/Sidebar';

/**
 * Main navigation items for the application
 */
export const mainSidebarItems: SidebarItem[] = [
  {
    label: 'Projects',
    href: '/projects',
  },
];

/**
 * Admin-only navigation items
 */
export const getAdminSidebarItems = (): SidebarItem[] => [
  {
    label: 'Projects',
    href: '/projects',
  },
  {
    label: 'Admin',
    href: '/admin',
  },
];

/**
 * Generate project-specific sidebar items based on user permissions
 */
export const getProjectSidebarItems = (projectId: string, isAdmin: boolean = false, canManageSettings: boolean = false): SidebarItem[] => {
  const items: SidebarItem[] = [
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
      label: 'Test Runs',
      href: `/projects/${projectId}/testruns`,
      children: [], // Will be populated dynamically
    },
    {
      label: 'Defects',
      href: `/projects/${projectId}/defects`,
    },
    {
      label: 'Members',
      href: `/projects/${projectId}/members`,
    },
  ];

  // Only show Settings if user has manage permissions (ADMIN, PROJECT_MANAGER) or testruns:update permission
  if (isAdmin || canManageSettings) {
    items.push({
      label: 'Settings',
      href: `/projects/${projectId}/settings`,
    });
  }

  // Add admin items if user is admin
  if (isAdmin) {
    items.push(
      {
        label: 'Admin',
        href: '/admin',
      }
    );
  }

  return items;
};

/**
 * Sidebar items for projects list page (without specific project)
 */
export const getProjectsPageSidebarItems = (isAdmin: boolean = false): SidebarItem[] => {
  const items: SidebarItem[] = [
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
      label: 'Test Runs',
      children: [],
    },
    {
      label: 'Defects',
      href: '#',
    },
    {
      label: 'Members',
      href: '#',
    },
  ];

  // Add admin items if user is admin
  if (isAdmin) {
    items.push(
      {
        label: 'Admin',
        href: '/admin',
      }
    );
  }

  return items;
};
