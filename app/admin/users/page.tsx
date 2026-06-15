import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import UserManagement from '@/frontend/components/admin/users/UserManagement';

export const metadata: Metadata = {
  title: 'Пользователи',
  description: 'Управление пользователями приложения и ролями',
};

export default async function UserManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  if (session.user.roleName !== 'ADMIN') {
    redirect('/projects');
  }

  return <UserManagement />;
}
