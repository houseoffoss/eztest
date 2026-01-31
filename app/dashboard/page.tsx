import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/frontend/reusable-elements/cards/Card';
import { GlassPanel } from '@/frontend/reusable-components/layout/GlassPanel';
import { TopBar } from '@/frontend/reusable-components/layout/TopBar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Dashboard' }]} />
      
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-8">
        <GlassPanel contentClassName="p-6">
          <h1 className="text-3xl font-bold text-foreground mb-4">Welcome to EZTest</h1>
          <div className="space-y-5">
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="h-5 w-5 text-green-300 mt-0.5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-green-200/90">
                  Authentication is working! You are now logged in.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border/40 bg-secondary/30 p-4">
              <h2 className="text-lg font-semibold text-foreground mb-3">User Information</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Name</dt>
                  <dd className="text-sm text-foreground font-medium">{session.user.name}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Email</dt>
                  <dd className="text-sm text-foreground font-medium">{session.user.email}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Role</dt>
                  <dd className="text-sm text-foreground font-medium">{session.user.roleName}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <h2 className="text-lg font-semibold text-primary mb-2">Next Steps</h2>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Set up UI components (ShadCN UI)</li>
                <li>Create application layout with navigation</li>
                <li>Implement Projects module</li>
                <li>Build Test Cases management</li>
                <li>Add Test Runs functionality</li>
              </ul>
            </div>

            {/* Sign out moved to top bar */}
          </div>
        </GlassPanel>
        {/* Glassy footer panel for dashboard */}
        <Card variant="glass" className="mt-12">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} EZTest Dashboard</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="hidden sm:inline">Glass theme active</span>
                <span className="text-primary">v0.1.0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
