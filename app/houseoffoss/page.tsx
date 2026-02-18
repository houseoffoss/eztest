import type { Metadata } from 'next';
import HouseOfFOSSPage from './HouseOfFOSSContent';
import { SITE_URL, SITE_NAME, OG_LOCALE, TWITTER_CARD, TWITTER_CREATOR, TWITTER_SITE } from '@/config/seo.config';

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

export default function HouseOfFOSS() {
  return <HouseOfFOSSPage />;
}

