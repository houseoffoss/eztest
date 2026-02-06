import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import TeamsChannelsManagement from '@/frontend/components/admin/teams-channels/TeamsChannelsManagement';

export const metadata: Metadata = {
  title: 'Teams Channels',
  description: 'Manage Teams channel to project mappings',
};

export default async function TeamsChannelsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  if (session.user.roleName !== 'ADMIN') {
    redirect('/projects');
  }

  return <TeamsChannelsManagement />;
}

