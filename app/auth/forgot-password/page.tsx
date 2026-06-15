import type { Metadata } from 'next';
import ForgotPasswordPage from './ForgotPasswordContent';

export const metadata: Metadata = {
  title: 'Забыли пароль',
  description: 'Сбросьте пароль EZTest. Введите email, чтобы получить ссылку для сброса.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPassword() {
  return <ForgotPasswordPage />;
}
