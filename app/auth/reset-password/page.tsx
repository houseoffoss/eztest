'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/design/GlassPanel';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  // Validate token
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('No reset token provided');
        setValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`);
        if (response.ok) {
          setTokenValid(true);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Invalid or expired token');
        }
      } catch {
        setError('Failed to validate token');
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white/[0.02] border-white/10 border-2 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-8">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
  <GlassPanel contentClassName="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create New Password</h1>
            <p className="text-muted-foreground">
              Enter your new password below.
            </p>
          </div>

          {success ? (
            <div className="rounded-lg p-4 text-center border border-green-500/40 bg-green-500/10">
              <h3 className="font-medium text-green-200 mb-2">Password Reset Successful</h3>
              <p className="text-green-200/90 text-sm mb-4">
                Your password has been reset. You can now log in with your new password.
              </p>
              <p className="text-green-200/90 text-sm">
                Redirecting to login page...
              </p>
            </div>
          ) : !tokenValid ? (
            <div className="rounded-lg p-4 border border-red-500/40 bg-red-500/10">
              <h3 className="font-medium text-red-200 mb-2">Invalid Reset Link</h3>
              <p className="text-red-200 text-sm mb-4">
                {error || 'The password reset link is invalid or has expired.'}
              </p>
              <Link
                href="/auth/forgot-password"
                className="text-red-300 hover:text-red-200 font-medium"
              >
                Request a new reset link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg p-4 border border-red-500/40 bg-red-500/10">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-[10px] border border-border bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  placeholder="Enter new password (min 8 characters)"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-[10px] border border-border bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  placeholder="Confirm your password"
                />
              </div>

              {/* Password Requirements */}
              <div className="rounded-lg p-3 text-sm border border-primary/30 bg-primary/5">
                <p className="font-medium mb-2 text-foreground">Password requirements:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>At least 8 characters long</li>
                  <li>Must match in both fields</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="glass-primary"
                className="w-full rounded-[10px]"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              <Link href="/auth/login" className="text-primary hover:text-primary/90 font-medium">
                Back to Login
              </Link>
            </p>
          </div>
  </GlassPanel>
      </div>
    </div>
  );
}
