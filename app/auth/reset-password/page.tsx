import type { Metadata } from 'next';
import ResetPasswordContent from './ResetPasswordContent';

export const metadata: Metadata = {
  title: 'Сброс пароля',
  description: 'Создайте новый пароль для аккаунта EZTest.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordPage() {
  return <ResetPasswordContent />;
}
