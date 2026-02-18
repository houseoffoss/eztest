import type { Metadata } from 'next';
import LoginPageComponent from '@/app/components/pages/LoginPageComponent';

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

export default function LoginPage() {
  return <LoginPageComponent />;
}
