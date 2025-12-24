import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import HomePage from '@/app/components/pages/HomePage';

// Prevent caching to ensure fresh session checks
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If user is already logged in, redirect to projects
  if (session) {
    redirect('/projects');
  }

  return <HomePage />;
}
