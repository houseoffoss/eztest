import { Metadata } from 'next';
import PrivacyPolicyPage from '@/app/components/pages/PrivacyPolicyPage';
import { SITE_URL, SITE_NAME } from '@/config/seo.config';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for EZTest - Learn how we collect, use, and protect your data in our self-hosted test management platform.',
  alternates: {
    canonical: '/privacy',
  },
  robots: {
    index: true,
    follow: true,
  },
};

function PrivacyJsonLd() {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: `${SITE_URL}/privacy` },
    ],
  };

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Privacy Policy | ${SITE_NAME}`,
    url: `${SITE_URL}/privacy`,
    description:
      'Privacy Policy for EZTest - Learn how we collect, use, and protect your data in our self-hosted test management platform.',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    inLanguage: 'en-US',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
    </>
  );
}

export default function Privacy() {
  return (
    <>
      <PrivacyJsonLd />
      <PrivacyPolicyPage />
    </>
  );
}
