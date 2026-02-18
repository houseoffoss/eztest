import type { Metadata } from 'next';
import RegisterPageComponent from '@/app/components/pages/RegisterPageComponent';

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

export default function RegisterPage() {
  return <RegisterPageComponent />;
}
