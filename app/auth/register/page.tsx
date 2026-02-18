import type { Metadata } from 'next';
import RegisterPageComponent from '@/app/components/pages/RegisterPageComponent';
import { SITE_URL, SITE_NAME } from '@/config/seo.config';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a free EZTest account to start managing your test cases, suites, and runs. Open-source, self-hosted test management for QA teams.',
  alternates: {
    canonical: '/auth/register',
  },
  robots: {
    index: true,
    follow: true,
  },
};

function RegisterJsonLd() {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Create Account', item: `${SITE_URL}/auth/register` },
    ],
  };

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Create Account | ${SITE_NAME}`,
    url: `${SITE_URL}/auth/register`,
    description:
      'Create a free EZTest account to start managing your test cases, suites, and runs. Open-source, self-hosted test management for QA teams.',
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

export default function RegisterPage() {
  return (
    <>
      <RegisterJsonLd />
      <RegisterPageComponent />
    </>
  );
}
