import { Metadata } from 'next';
import PrivacyPolicyPage from '@/app/components/pages/PrivacyPolicyPage';

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

export default function Privacy() {
  return <PrivacyPolicyPage />;
}
