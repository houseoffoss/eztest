'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    <div className="min-h-screen flex bg-gradient-to-br from-[#f0f9ff] to-white">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-12 bg-gradient-to-br from-[#033977] to-[#044a99] text-white relative overflow-hidden">
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-12 group">
            <span className="text-3xl">🧪</span>
            <span className="text-2xl font-bold group-hover:scale-105 transition-transform">EZTest</span>
          </Link>
          <h2 className="text-4xl font-bold mb-4">
            Welcome back! 👋
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Sign in to manage your test cases, track executions, and collaborate with your team.
          </p>
        </div>
        <div className="space-y-4 relative z-10">
          <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <span className="text-2xl">✨</span>
            <div>
              <h3 className="font-semibold mb-1">Simple & Powerful</h3>
              <p className="text-white/70 text-sm">Everything you need for test management in one place</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <span className="text-2xl">🚀</span>
            <div>
              <h3 className="font-semibold mb-1">Self-Hosted</h3>
              <p className="text-white/70 text-sm">Your data stays with you, always</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2 lg:hidden">
                <span className="text-2xl">🧪</span>
                <span className="text-xl font-bold text-[#033977]">EZTest</span>
              </div>
              <h1 className="text-2xl font-bold text-[#033977]">Sign in</h1>
              <p className="text-[#656c79] mt-1">Access your test management workspace</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <span>❌</span>
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#033977] mb-2"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#033977] focus:border-transparent transition-all text-gray-900 placeholder:text-[#656c79]/50"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#033977] mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#033977] focus:border-transparent transition-all text-gray-900 placeholder:text-[#656c79]/50"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#f34923] text-white py-3 px-4 rounded-xl hover:bg-[#d63f1f] focus:outline-none focus:ring-2 focus:ring-[#f34923] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-lg shadow-[#f34923]/30 hover:shadow-xl hover:shadow-[#f34923]/40"
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
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#656c79]">
                Don&apos;t have an account?{' '}
                <Link
                  href="/auth/register"
                  className="text-[#033977] hover:text-[#f34923] font-semibold transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl">
            <div className="flex items-start gap-2">
              <span className="text-lg">💡</span>
              <div>
                <p className="text-sm font-medium text-[#033977] mb-1">Try it out!</p>
                <p className="text-xs text-[#656c79] font-mono">
                  admin@eztest.local / Admin@123456
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
