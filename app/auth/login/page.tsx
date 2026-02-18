import type { Metadata } from 'next';
import LoginPageComponent from '@/app/components/pages/LoginPageComponent';
import { SITE_URL, SITE_NAME } from '@/config/seo.config';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to EZTest to manage your test cases, test suites, test runs, and defects. Access your self-hosted test management dashboard.',
  alternates: {
    canonical: '/auth/login',
  },
  robots: {
    index: true,
    follow: true,
  },
};

function LoginJsonLd() {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Sign In', item: `${SITE_URL}/auth/login` },
    ],
  };

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Sign In | ${SITE_NAME}`,
    url: `${SITE_URL}/auth/login`,
    description:
      'Sign in to EZTest to manage your test cases, test suites, test runs, and defects.',
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

export default function LoginPage() {
  return (
    <>
      <LoginJsonLd />
      <LoginPageComponent />
    </>
  );
}
