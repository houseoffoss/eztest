import type { Metadata } from 'next';
import ErrorContent from './ErrorContent';

export const metadata: Metadata = {
  title: 'Authentication Error',
  description: 'An authentication error occurred. Please try signing in again.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthErrorPage() {
  return <ErrorContent />;
}
