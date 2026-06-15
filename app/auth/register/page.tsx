import type { Metadata } from 'next';
import RegisterPageComponent from '@/app/components/pages/RegisterPageComponent';
import { SITE_URL, SITE_NAME } from '@/config/seo.config';

export const metadata: Metadata = {
  title: 'Регистрация',
  description: 'Создайте бесплатный аккаунт EZTest и начните управлять тест-кейсами, сьютами и тест-ранами.',
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
      { '@type': 'ListItem', position: 1, name: 'Главная', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Регистрация', item: `${SITE_URL}/auth/register` },
    ],
  };

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Регистрация | ${SITE_NAME}`,
    url: `${SITE_URL}/auth/register`,
    description:
      'Создайте бесплатный аккаунт EZTest и начните управлять тест-кейсами, сьютами и тест-ранами.',
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

export default function RegisterPage() {
  return (
    <>
      <RegisterJsonLd />
      <RegisterPageComponent />
    </>
  );
}
