import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import UserDetailsContent from '../../../../frontend/components/admin/users/UserDetailsContent';

interface AdminUserDetailsPageProps {
  params: {
    userId: string;
  };
}

export const metadata: Metadata = {
  title: 'User Details | Admin',
  description: 'View and manage user details',
};

export default async function AdminUserDetailsPage({ params }: AdminUserDetailsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Check if user is admin
  if (session.user.roleName !== 'ADMIN') {
    redirect('/projects');
  }

  // Fetch user details
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
      role: true,
      _count: {
        select: {
          createdProjects: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/admin/users');
  }

  return <UserDetailsContent user={user} />;
}
