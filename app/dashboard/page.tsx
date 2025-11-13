import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/design/GlassPanel';
import { Navbar } from '@/components/design/Navbar';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Projects', href: '/projects' },
          { label: 'Runs', href: '/runs' },
        ]}
        actions={
          <form action="/api/auth/signout" method="POST">
            <Button type="submit" variant="glass-destructive" size="sm" className="px-5">
              Sign Out
            </Button>
          </form>
        }
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-10">
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
                  <dd className="text-sm text-foreground font-medium">{session.user.role}</dd>
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

            {/* Sign out moved to navbar */}
          </div>
        </GlassPanel>
        {/* Glassy footer panel for dashboard */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl ring-1 ring-white/5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} EZTest Dashboard</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="hidden sm:inline">Glass theme active</span>
              <span className="text-primary">v0.1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
