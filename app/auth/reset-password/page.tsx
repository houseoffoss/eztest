import type { Metadata } from 'next';
import ResetPasswordContent from './ResetPasswordContent';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Create a new password for your EZTest account.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordPage() {
  return <ResetPasswordContent />;
}
