/**
 * Centralized SEO/GEO configuration for EZTest
 * Used across metadata exports, structured data, and sitemap generation.
 */

/** The canonical production URL (no trailing slash). */
export const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://eztest.houseoffoss.com';

/** Core brand / site-wide SEO constants */
export const SITE_NAME = 'EZTest';
export const SITE_TITLE_DEFAULT = 'EZTest - Open Source Test Management for Modern QA Teams';
export const SITE_TITLE_TEMPLATE = '%s | EZTest';
export const SITE_DESCRIPTION =
  'EZTest is a lightweight, open-source, self-hosted test management platform. Organize test cases, suites, runs, and defects in one transparent platform built for modern QA and engineering teams.';

export const SITE_KEYWORDS = [
  'test management',
  'open source test management',
  'QA tool',
  'test case management',
  'self-hosted testing',
  'test management platform',
  'manual testing tool',
  'test suite management',
  'test run tracking',
  'defect tracking',
  'bug tracking',
  'quality assurance',
  'software testing',
  'test execution',
  'QA management',
  'EZTest',
  'open source QA',
  'free test management',
  'nextjs test management',
  'self-hosted QA tool',
];

/** Open Graph defaults */
export const OG_IMAGE_PATH = '/screenshots/TestCase_List_Page1.png';
export const OG_IMAGE_WIDTH = 1920;
export const OG_IMAGE_HEIGHT = 1080;
export const OG_IMAGE_ALT = 'EZTest - Open Source Test Management Platform Dashboard';
export const OG_LOCALE = 'en_US';
export const OG_TYPE = 'website';

/** Twitter card defaults */
export const TWITTER_CARD = 'summary_large_image' as const;
export const TWITTER_CREATOR = '@houseoffoss';
export const TWITTER_SITE = '@houseoffoss';

/** Organisation / publisher info for structured data */
export const ORG_NAME = 'Belsterns';
export const ORG_URL = 'https://belsterns.com';
export const GITHUB_URL = 'https://github.com/houseoffoss/eztest';
export const HOUSE_OF_FOSS_URL = 'https://www.houseoffoss.com';

/** Per-page SEO config (internal / authenticated pages) */
export const CONFIG_SEO = {
  Projects: {
    title: 'Projects',
    description: 'Manage your test projects and track progress',
  },
  ProjectDetail: {
    title: 'Project Overview',
    description: 'View project details, test cases, and team members',
  },
  TestCases: {
    title: 'Test Cases',
    description: 'Manage and execute test cases for your project',
  },
  TestCaseDetail: {
    title: 'Test Case Details',
    description: 'View and edit test case details and execution history',
  },
  ProjectSettings: {
    title: 'Project Settings',
    description: 'Configure project settings and preferences',
  },
  ProjectMembers: {
    title: 'Team Members',
    description: 'Manage project team members and permissions',
  },
  Dashboard: {
    title: 'Dashboard',
    description: 'Overview of your testing activities and metrics',
  },
  Settings: {
    title: 'Settings',
    description: 'Manage your account settings and preferences',
  },
  Profile: {
    title: 'Profile',
    description: 'View and edit your user profile information',
  },
  Account: {
    title: 'Account Settings',
    description: 'Manage your account security and preferences',
  },
} as const;

export default CONFIG_SEO;
