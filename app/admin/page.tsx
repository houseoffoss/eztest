import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AdminDashboard from '@/frontend/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Панель администратора',
  description: 'Системное администрирование и управление',
};

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Check if user is admin
  if (session.user.roleName !== 'ADMIN') {
    redirect('/projects');
  }

  return <AdminDashboard />;
}
