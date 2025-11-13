'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navbar } from '@/components/design/Navbar';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col">
      <Navbar
        actions={
          <div className="flex items-center gap-2">
            <Button variant="glass" asChild>
              <Link href="/auth/register">Sign up</Link>
            </Button>
          </div>
        }
      />
      {/* Split container: Left content, Right form aligned to Navbar width */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-8 gap-8">
        {/* Left Side - Branding (Glass Panel) */}
        <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-10 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-60" style={{background: 'radial-gradient(circle at 25% 30%, rgba(11,114,255,0.25), transparent 60%), radial-gradient(circle at 80% 70%, rgba(255,122,24,0.25), transparent 55%)'}} />
          <div className="bg-white/[0.02] border-white/10 border-2 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] h-full w-full p-10 flex flex-col justify-between">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-12 group">
                <span className="text-3xl">🧪</span>
                <span className="text-2xl font-bold group-hover:scale-105 transition-transform text-primary">EZTest</span>
              </Link>
              <h2 className="text-4xl font-bold mb-4 text-white">
                Welcome back! 👋
              </h2>
              <p className="text-white/80 text-lg leading-relaxed max-w-md">
                Sign in to manage test cases, track executions, and collaborate with your team.
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-white/[0.02] border-white/10 border-2 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <h3 className="font-semibold mb-1">Simple & Powerful</h3>
                    <p className="text-muted-foreground text-sm">All essentials in one place</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/[0.02] border-white/10 border-2 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🚀</span>
                  <div>
                    <h3 className="font-semibold mb-1">Self-Hosted</h3>
                    <p className="text-muted-foreground text-sm">Your data, your control</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="w-full max-w-md">
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2 lg:hidden">
                <span className="text-2xl">🧪</span>
                <span className="text-xl font-bold text-primary">EZTest</span>
              </div>
              <CardTitle className="text-2xl">Sign in</CardTitle>
              <CardDescription>Access your test management workspace</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription className="flex items-center gap-2">
                      <span>❌</span>
                      <span>{error}</span>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="you@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                  />
                </div>

                <Button
                  type="submit"
                  variant="glass-accent"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign in
                      <span>→</span>
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex-col gap-4">
              <p className="text-sm text-center text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link
                  href="/auth/register"
                  className="text-primary hover:text-accent font-semibold transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
            </CardFooter>
          </Card>

          {/* Demo credentials hint */}
            <Card variant="glass" className="bg-white/[0.02] border-white/10 border-2 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] mt-6">
              <CardContent className="pt-5">
                <div className="flex items-start gap-3">
                  <span className="text-lg">💡</span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-primary tracking-wide">Try it out!</p>
                    <p className="text-xs font-mono bg-black/30 rounded px-2 py-1 text-accent-foreground">
                      <span className="text-accent">admin@eztest.local</span>
                      <span className="px-1 text-muted-foreground">/</span>
                      <span className="text-accent">Admin@123456</span>
                    </p>
                    {/* <p className="text-[10px] text-muted-foreground">Change the default admin password after first login.</p> */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
