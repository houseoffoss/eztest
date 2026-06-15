import { type SidebarProps } from '@/frontend/reusable-components';

type SidebarItem = SidebarProps['items'][number];

/**
 * Main navigation items for the application
 */
export const mainSidebarItems: SidebarItem[] = [
  {
    label: 'Проекты',
    href: '/projects',
  },
];

/**
 * Admin-only navigation items
 */
export const getAdminSidebarItems = (): SidebarItem[] => [
  {
    label: 'Проекты',
    href: '/projects',
  },
  {
    label: 'Админка',
    href: '/admin',
  },
];

/**
 * Generate project-specific sidebar items based on user permissions
 */
export const getProjectSidebarItems = (projectId: string, isAdmin: boolean = false, canManageSettings: boolean = false): SidebarItem[] => {
  const items: SidebarItem[] = [
    {
      label: 'Проекты',
      href: '/projects',
    },
    {
      label: 'Тест-сьюты',
      href: `/projects/${projectId}/testsuites`,
      children: [], // Will be populated dynamically
    },
    {
      label: 'Тест-кейсы',
      href: `/projects/${projectId}/testcases`,
    },
    {
      label: 'Тест-раны',
      href: `/projects/${projectId}/testruns`,
      children: [], // Will be populated dynamically
    },
    {
      label: 'Дефекты',
      href: `/projects/${projectId}/defects`,
    },
    {
      label: 'Участники',
      href: `/projects/${projectId}/members`,
    },
  ];

  // Only show Settings if user has manage permissions (ADMIN, PROJECT_MANAGER) or testruns:update permission
  if (isAdmin || canManageSettings) {
    items.push({
      label: 'Настройки',
      href: `/projects/${projectId}/settings`,
    });
  }

  // Add admin items if user is admin
  if (isAdmin) {
    items.push(
      {
        label: 'Админка',
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
      label: 'Проекты',
      href: '/projects',
    },
    {
      label: 'Тест-сьюты',
      children: [],
    },
    {
      label: 'Тест-кейсы',
      href: '#',
    },
    {
      label: 'Тест-раны',
      children: [],
    },
    {
      label: 'Дефекты',
      href: '#',
    },
    {
      label: 'Участники',
      href: '#',
    },
  ];

  // Add admin items if user is admin
  if (isAdmin) {
    items.push(
      {
        label: 'Админка',
        href: '/admin',
      }
    );
  }

  return items;
};
