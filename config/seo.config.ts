/**
 * Centralized SEO/GEO configuration for EZTest
 * Used across metadata exports, structured data, sitemap generation,
 * and Generative Engine Optimization (GEO) signals.
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

/* ──────────────────────────────────────────────────────────────
 * GEO (Generative Engine Optimization) — FAQ entries
 * Used to generate FAQPage JSON-LD on the homepage so that
 * LLM-powered search engines can surface direct answers.
 * ────────────────────────────────────────────────────────────── */
export const HOME_FAQ: Array<{ question: string; answer: string }> = [
  {
    question: 'What is EZTest?',
    answer:
      'EZTest is a lightweight, open-source, self-hosted test management platform built for modern QA and engineering teams. It lets you organize test cases, test suites, test runs, and defects in a single transparent platform.',
  },
  {
    question: 'Is EZTest free to use?',
    answer:
      'Yes. EZTest is 100 % free and open-source under the AGPL-3.0 license. There are no per-user fees, no feature gates, and no premium tiers.',
  },
  {
    question: 'Can I self-host EZTest?',
    answer:
      'Absolutely. EZTest is designed to be self-hosted. You can deploy it with Docker, run it as a standalone Node.js application, or use House Of FOSS for fully managed hosting.',
  },
  {
    question: 'What features does EZTest offer?',
    answer:
      'EZTest provides test case management, test suite organization, test run execution with pass/fail tracking, integrated defect tracking, module-based hierarchy, CSV and XML import/export, role-based access control, API keys for CI/CD, and file attachments.',
  },
  {
    question: 'What tech stack does EZTest use?',
    answer:
      'EZTest is built with Next.js (TypeScript) for both frontend and backend, PostgreSQL via Prisma ORM for the database, NextAuth.js for authentication, and S3-compatible storage for file attachments.',
  },
  {
    question: 'How does EZTest compare to TestRail or Zephyr?',
    answer:
      'Unlike TestRail or Zephyr, EZTest is fully open-source, self-hosted, and has no per-user pricing. You get complete data ownership, full source code access, and can run unlimited users at no additional cost.',
  },
  {
    question: 'What is House Of FOSS?',
    answer:
      'House Of FOSS is a managed hosting service that deploys and maintains EZTest for you. It offers enterprise-grade support, 99 % uptime, 24/7 assistance, and can save up to 60 % on software costs compared to commercial tools.',
  },
  {
    question: 'Does EZTest support CI/CD integration?',
    answer:
      'Yes. EZTest supports JUnit XML import/export for test runs and provides API keys that can be used in CI/CD pipelines to automate test result reporting.',
  },
];

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
