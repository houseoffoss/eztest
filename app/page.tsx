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

/** JSON-LD structured data for the homepage (SoftwareApplication + Organization) */
function HomeJsonLd() {
  const softwareApp = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
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
    keywords: 'test management, open source, QA tool, self-hosted, test cases, defect tracking',
  };

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG_NAME,
    url: ORG_URL,
    logo: `${SITE_URL}/favicon.png`,
    sameAs: [GITHUB_URL, 'https://www.houseoffoss.com'],
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
