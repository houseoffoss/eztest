import type { Metadata } from 'next';
import ForgotPasswordPage from './ForgotPasswordContent';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your EZTest account password. Enter your email to receive a password reset link.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPassword() {
  return <ForgotPasswordPage />;
}
