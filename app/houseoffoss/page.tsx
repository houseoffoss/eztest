import type { Metadata } from 'next';
import HouseOfFOSSPage from './HouseOfFOSSContent';
import {
  SITE_URL,
  SITE_NAME,
  OG_LOCALE,
  TWITTER_CARD,
  TWITTER_CREATOR,
  TWITTER_SITE,
  ORG_NAME,
  ORG_URL,
  HOUSE_OF_FOSS_URL,
} from '@/config/seo.config';

export const metadata: Metadata = {
  title: 'Launch EZTest with House Of FOSS',
  description:
    'Get EZTest fully managed and deployed in minutes with House Of FOSS. Save up to 60% on software costs with enterprise-grade support, 99% uptime, and 24/7 assistance.',
  alternates: {
    canonical: '/houseoffoss',
  },
  openGraph: {
    type: 'website',
    locale: OG_LOCALE,
    url: `${SITE_URL}/houseoffoss`,
    siteName: SITE_NAME,
    title: 'Launch EZTest with House Of FOSS',
    description:
      'Get EZTest fully managed and deployed in minutes. Save up to 60% on software costs with enterprise-grade support and 99% uptime guarantee.',
    images: [
      {
        url: '/screenshots/TestCase_List_Page1.png',
        width: 1920,
        height: 1080,
        alt: 'EZTest - Managed Hosting by House Of FOSS',
      },
    ],
  },
  twitter: {
    card: TWITTER_CARD,
    title: 'Launch EZTest with House Of FOSS',
    description:
      'Get EZTest fully managed and deployed in minutes. Save up to 60% on software costs.',
    site: TWITTER_SITE,
    creator: TWITTER_CREATOR,
  },
};

/** JSON-LD structured data for the House Of FOSS managed hosting page */
function HouseOfFOSSJsonLd() {
  const service = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${SITE_NAME} — Managed by House Of FOSS`,
    url: `${SITE_URL}/houseoffoss`,
    description:
      'Get EZTest fully managed and deployed in minutes with House Of FOSS. Enterprise-grade support, 99% uptime, and up to 60% cost savings compared to commercial tools.',
    applicationCategory: 'DeveloperApplication',
    applicationSubCategory: 'Test Management',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Pay only for server usage — no per-user pricing.',
      availability: 'https://schema.org/InStock',
    },
    provider: {
      '@type': 'Organization',
      name: 'House Of FOSS',
      url: HOUSE_OF_FOSS_URL,
    },
    creator: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: ORG_URL,
    },
    featureList: [
      'Managed Deployment',
      'Enterprise-Grade Security',
      '99% Uptime Guarantee',
      '24/7 Support',
      'Regular Backups',
      'Custom Solutions',
      'Data Ownership',
      'No Per-User Pricing',
    ],
  };

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
      {
        '@type': 'ListItem',
        position: 2,
        name: 'House Of FOSS',
        item: `${SITE_URL}/houseoffoss`,
      },
    ],
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is House Of FOSS?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'House Of FOSS is a managed hosting service that deploys and maintains open-source software like EZTest for you. It provides enterprise-grade support, 99% uptime, 24/7 assistance, and can save up to 60% on software costs compared to commercial tools.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much does managed EZTest hosting cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'With House Of FOSS, you pay only for server usage instead of fixed monthly rates or per-user pricing. This model can save up to 60% compared to commercial test management tools like TestRail or Zephyr.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I get started with House Of FOSS?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Getting started is simple: 1) Log in to House Of FOSS, 2) Create a workspace, 3) Choose EZTest from available applications, 4) Launch and start managing your tests immediately.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I keep ownership of my data with House Of FOSS?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Your data stays yours with full control and no vendor lock-in. You can export your data at any time and migrate to self-hosted if desired.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
    </>
  );
}

export default function HouseOfFOSS() {
  return (
    <>
      <HouseOfFOSSJsonLd />
      <HouseOfFOSSPage />
    </>
  );
}

