import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import HomePage from '@/app/components/pages/HomePage';
import {
  SITE_URL,
  SITE_NAME,
  SITE_TITLE_DEFAULT,
  SITE_DESCRIPTION,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_ALT,
  OG_LOCALE,
  TWITTER_CARD,
  TWITTER_CREATOR,
  TWITTER_SITE,
  GITHUB_URL,
  ORG_NAME,
  ORG_URL,
  HOME_FAQ,
} from '@/config/seo.config';

// Prevent caching to ensure fresh session checks
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: SITE_TITLE_DEFAULT,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: OG_LOCALE,
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_PATH,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: OG_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: TWITTER_CARD,
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
    site: TWITTER_SITE,
    creator: TWITTER_CREATOR,
    images: [
      {
        url: OG_IMAGE_PATH,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: OG_IMAGE_ALT,
      },
    ],
  },
};

/**
 * JSON-LD structured data for the homepage.
 * Includes: SoftwareApplication, Organization, WebSite, FAQPage, BreadcrumbList.
 * The FAQPage and BreadcrumbList schemas are key GEO signals — they give
 * generative search engines direct, citable answers and navigation context.
 */
function HomeJsonLd() {
  const softwareApp = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: 'DeveloperApplication',
    applicationSubCategory: 'Test Management',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    screenshot: `${SITE_URL}${OG_IMAGE_PATH}`,
    softwareVersion: '0.1.0',
    license: 'https://github.com/houseoffoss/eztest/blob/main/LICENSE',
    isAccessibleForFree: true,
    creator: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: ORG_URL,
    },
    codeRepository: GITHUB_URL,
    programmingLanguage: ['TypeScript', 'JavaScript'],
    keywords:
      'test management, open source, QA tool, self-hosted, test cases, defect tracking, test suites, test runs',
    featureList: [
      'Test Case Management',
      'Test Suite Organization',
      'Test Run Execution',
      'Defect Tracking',
      'Module Hierarchy',
      'CSV and XML Import/Export',
      'Role-Based Access Control',
      'API Keys for CI/CD',
      'File Attachments',
      'Self-Hosted Deployment',
    ],
  };

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG_NAME,
    url: ORG_URL,
    logo: `${SITE_URL}/favicon.png`,
    sameAs: [GITHUB_URL, 'https://www.houseoffoss.com'],
    contactPoint: {
      '@type': 'ContactPoint',
      url: 'https://github.com/houseoffoss/eztest/issues',
      contactType: 'technical support',
    },
  };

  const webSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: ORG_URL,
    },
    inLanguage: 'en-US',
  };

  /* GEO: FAQPage — lets generative engines surface direct answers */
  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOME_FAQ.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  /* GEO: BreadcrumbList — gives crawlers navigational context */
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSite) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If user is already logged in, redirect to projects
  if (session) {
    redirect('/projects');
  }

  return (
    <>
      <HomeJsonLd />
      <HomePage />
    </>
  );
}
