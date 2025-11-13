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

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        setIsLoading(false);
        return;
      }

      // Auto sign in after successful registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        // Registration successful but login failed, redirect to login
        router.push('/auth/login?registered=true');
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
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
        }
      />
      {/* Split container: Left content, Right form aligned to Navbar width */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-8 gap-8">
        {/* Left Side - Branding & Features (Glass Panel) */}
        <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-10 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-60" style={{background: 'radial-gradient(circle at 25% 30%, rgba(11,114,255,0.25), transparent 60%), radial-gradient(circle at 80% 70%, rgba(255,122,24,0.25), transparent 55%)'}} />
          <div className="bg-white/[0.02] border-white/10 border-2 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] h-full w-full p-10 flex flex-col justify-between">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-12 group">
                <span className="text-3xl">🧪</span>
                <span className="text-2xl font-bold group-hover:scale-105 transition-transform text-primary">EZTest</span>
              </Link>
              <h2 className="text-4xl font-bold mb-4 text-white">
                Start Testing Smarter 🚀
              </h2>
              <p className="text-white/80 text-lg leading-relaxed max-w-md">
                Join teams who have simplified their test management. No credit card required, start for free today.
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-white/[0.02] border-white/10 border-2 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h3 className="font-semibold mb-1">Complete Control</h3>
                    <p className="text-muted-foreground text-sm">Self-host on your infrastructure, own your data completely</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/[0.02] border-white/10 border-2 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <h3 className="font-semibold mb-1">Lightweight & Fast</h3>
                    <p className="text-muted-foreground text-sm">Runs on minimal resources, no complex setup required</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/[0.02] border-white/10 border-2 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔓</span>
                  <div>
                    <h3 className="font-semibold mb-1">100% Open Source</h3>
                    <p className="text-muted-foreground text-sm">Free forever,transparent and community-driven</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="w-full max-w-md">
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2 lg:hidden">
                <span className="text-2xl">🧪</span>
                <span className="text-xl font-bold text-primary">EZTest</span>
              </div>
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>Get started with EZTest for free</CardDescription>
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
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 8 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
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
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-4">
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-primary hover:text-accent font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
