import { type SidebarProps } from '@/frontend/reusable-components';

type SidebarItem = SidebarProps['items'][number];

/**
 * Main navigation items for the application
 */
export const mainSidebarItems: SidebarItem[] = [
  {
    label: 'プロジェクト',
    href: '/projects',
  },
];

/**
 * Admin-only navigation items
 */
export const getAdminSidebarItems = (): SidebarItem[] => [
  {
    label: 'プロジェクト',
    href: '/projects',
  },
  {
    label: '管理',
    href: '/admin',
  },
];

/**
 * Generate project-specific sidebar items based on user permissions
 */
export const getProjectSidebarItems = (projectId: string, isAdmin: boolean = false, canManageSettings: boolean = false): SidebarItem[] => {
  const items: SidebarItem[] = [
    {
      label: 'プロジェクト',
      href: '/projects',
    },
    {
      label: 'テストスイート',
      href: `/projects/${projectId}/testsuites`,
      children: [],
    },
    {
      label: 'テストケース',
      href: `/projects/${projectId}/testcases`,
    },
    {
      label: 'テストラン',
      href: `/projects/${projectId}/testruns`,
      children: [],
    },
    {
      label: 'Defect',
      href: `/projects/${projectId}/defects`,
    },
    {
      label: 'メンバー',
      href: `/projects/${projectId}/members`,
    },
  ];

  if (isAdmin || canManageSettings) {
    items.push({
      label: '設定',
      href: `/projects/${projectId}/settings`,
    });
  }

  if (isAdmin) {
    items.push(
      {
        label: '管理',
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
      label: 'プロジェクト',
      href: '/projects',
    },
    {
      label: 'テストスイート',
      children: [],
    },
    {
      label: 'テストケース',
      href: '#',
    },
    {
      label: 'テストラン',
      children: [],
    },
    {
      label: 'Defect',
      href: '#',
    },
    {
      label: 'メンバー',
      href: '#',
    },
  ];

  if (isAdmin) {
    items.push(
      {
        label: '管理',
        href: '/admin',
      }
    );
  }

  return items;
};
