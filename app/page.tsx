import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/design/Navbar';
import { GlassFooter } from '@/components/design/GlassFooter';

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If user is already logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar
        actions={
          <div className="flex items-center gap-2">
            <Button variant="glass" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button variant="glass-accent" asChild>
              <Link href="/auth/register">Get started</Link>
            </Button>
          </div>
        }
      />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="text-center mb-24 relative">
          {/* Simple Gradient Orb */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl -z-10"></div>

          <Badge className="mb-8">
            <span>✨ Open Source & Self-Hosted</span>
          </Badge>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
            Test Management,
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Lightweight, powerful test management platform that runs on minimal hardware.
            Perfect for teams who want control without complexity.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="glass-accent" size="lg" asChild>
              <Link href="/auth/register">
                Start Testing 🚀
              </Link>
            </Button>
            <Button variant="glass" size="lg" asChild>
              <Link href="/auth/login">
                Sign In
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          <Card variant="glass" className="bg-white/[0.02] border-white/10 border-2 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] group hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardHeader>
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📊</div>
              <CardTitle>Multi-Project Support</CardTitle>
              <CardDescription>
                Manage multiple projects with role-based access control. Keep everything organized in one place.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card variant="glass" className="bg-white/[0.02] border-white/10 border-2 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] group hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardHeader>
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">🗂️</div>
              <CardTitle>Hierarchical Tests</CardTitle>
              <CardDescription>
                Organize tests in hierarchical suites. Create detailed test cases with steps and expected results.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card variant="glass" className="bg-white/[0.02] border-white/10 border-2 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] group hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardHeader>
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">▶️</div>
              <CardTitle>Test Execution</CardTitle>
              <CardDescription>
                Run tests and track results in real-time. Monitor progress with comprehensive dashboards.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card variant="glass" className="bg-white/[0.02] border-white/10 border-2 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] group hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardHeader>
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">🔗</div>
              <CardTitle>Traceability</CardTitle>
              <CardDescription>
                Link test cases to requirements. Ensure complete coverage and maintain audit trails.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card variant="glass" className="bg-white/[0.02] border-white/10 border-2 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] group hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardHeader>
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">💬</div>
              <CardTitle>Collaboration</CardTitle>
              <CardDescription>
                Add comments, attach files, and collaborate with your team. Everything in context.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card variant="glass" className="bg-white/[0.02] border-white/10 border-2 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] group hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardHeader>
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">⚡</div>
              <CardTitle>Lightweight</CardTitle>
              <CardDescription>
                Runs efficiently on minimal hardware. 1 core, 2GB RAM is all you need to get started.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Section */}
        <Card variant="glass" className="bg-white/[0.02] border-white/10 border-2 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] relative overflow-hidden text-white">
          <CardContent className="p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose EZTest? 🤔</h2>
            <p className="text-white/90 text-lg mb-12 max-w-2xl mx-auto">
              Built for teams who value simplicity, control, and open-source freedom
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="group">
                <div className="text-5xl font-bold mb-3 group-hover:scale-110 transition-transform">100%</div>
                <div className="text-white/80 text-sm">Open Source</div>
              </div>
              <div className="group">
                <div className="text-5xl font-bold mb-3 group-hover:scale-110 transition-transform">2GB</div>
                <div className="text-white/80 text-sm">RAM Required</div>
              </div>
              <div className="group">
                <div className="text-5xl font-bold mb-3 group-hover:scale-110 transition-transform">∞</div>
                <div className="text-white/80 text-sm">Projects & Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <GlassFooter />
    </div>
  );
}
