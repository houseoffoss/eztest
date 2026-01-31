'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { GlassPanel } from '@/frontend/reusable-components/layout/GlassPanel';
import Link from 'next/link';

function ResetPasswordContent() {
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

  useEffect(() => {
    document.title = 'Reset Password | EZTest';
  }, []);

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
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#0a1628]">
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#0a1628]">
      <div className="w-full max-w-md">
        {/* Card */}
        <GlassPanel contentClassName="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Create New Password</h1>
            <p className="text-white/70 text-sm">
              Enter your new password below.
            </p>
          </div>

          {success ? (
            <div className="rounded-lg p-4 text-center border border-green-500/40 bg-green-500/10">
              <h3 className="font-semibold text-green-400 mb-2 text-sm">Password Reset Successful</h3>
              <p className="text-green-300/90 text-sm mb-3">
                Your password has been reset. You can now log in with your new password.
              </p>
              <p className="text-green-300/90 text-sm">
                Redirecting to login page...
              </p>
            </div>
          ) : !tokenValid ? (
            <div className="rounded-lg p-4 border border-red-500/40 bg-red-500/10">
              <h3 className="font-semibold text-red-400 mb-2 text-sm">Invalid Reset Link</h3>
              <p className="text-red-300 text-sm mb-4">
                {error || 'The password reset link is invalid or has expired.'}
              </p>
              <Link
                href="/auth/forgot-password"
                className="text-red-400 hover:text-red-300 font-semibold underline"
              >
                Request a new reset link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg p-4 border border-red-500/40 bg-red-500/10">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setPassword(e.target.value)}
                  required
                  placeholder="Enter new password (min 8 characters)"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                />
              </div>

              {/* Password Requirements */}
              <div className="rounded-lg p-3 text-sm border border-primary/30 bg-primary/5">
                <p className="font-semibold mb-2 text-white">Password requirements:</p>
                <ul className="list-disc list-inside space-y-1 text-white/70">
                  <li>At least 8 characters long</li>
                  <li>Must match in both fields</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <ButtonPrimary
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </ButtonPrimary>
              </div>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              <Link href="/auth/login" className="text-primary hover:text-accent font-semibold transition-colors">
                Back to Login
              </Link>
            </p>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
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
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
