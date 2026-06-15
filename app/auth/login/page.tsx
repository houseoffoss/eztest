import type { Metadata } from 'next';
import LoginPageComponent from '@/app/components/pages/LoginPageComponent';
import { SITE_URL, SITE_NAME } from '@/config/seo.config';

export const metadata: Metadata = {
  title: 'Вход',
  description: 'Войдите в EZTest, чтобы управлять тест-кейсами, тест-сьютами, тест-ранами и дефектами.',
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
      { '@type': 'ListItem', position: 1, name: 'Главная', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Вход', item: `${SITE_URL}/auth/login` },
    ],
  };

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Вход | ${SITE_NAME}`,
    url: `${SITE_URL}/auth/login`,
    description:
      'Войдите в EZTest, чтобы управлять тест-кейсами, тест-сьютами, тест-ранами и дефектами.',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    inLanguage: 'ru-RU',
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
