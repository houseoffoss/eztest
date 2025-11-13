'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/design/GlassPanel';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send reset email');
      }

      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
  <GlassPanel contentClassName="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Reset Password</h1>
            <p className="text-muted-foreground">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {success ? (
            <div className="rounded-lg p-4 mb-6 border border-green-500/40 bg-green-500/10">
              <h3 className="font-medium text-green-200 mb-2">Check your email</h3>
              <p className="text-green-200/90 text-sm mb-4">
                We&apos;ve sent a password reset link to <strong>{email}</strong>.
                Please check your email and follow the link to reset your password.
              </p>
              <p className="text-green-200/90 text-sm mb-4">
                The link will expire in 1 hour for security reasons.
              </p>
              <p className="text-green-200/90 text-sm">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setSuccess(false)}
                  className="font-medium text-green-900 hover:underline"
                >
                  try again with a different email
                </button>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg p-4 border border-red-500/40 bg-red-500/10">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-[10px] border border-border bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  placeholder="you@example.com"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="glass-primary"
                className="w-full rounded-[10px]"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Remember your password?{' '}
              <Link href="/auth/login" className="text-primary hover:text-primary/90 font-medium">
                Back to Login
              </Link>
            </p>
          </div>
  </GlassPanel>

  {/* Help Text */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>If you need further assistance, please contact support.</p>
        </div>
      </div>
    </div>
  );
}
