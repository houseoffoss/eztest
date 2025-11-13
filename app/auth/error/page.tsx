'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/design/GlassPanel';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = () => {
    switch (error) {
      case 'CredentialsSignin':
        return 'Invalid email or password. Please try again.';
      case 'SessionRequired':
        return 'You must be signed in to access this page.';
      default:
        return 'An authentication error occurred. Please try again.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
    <div className="w-full max-w-md">
  <GlassPanel contentClassName="p-8">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Authentication Error</h1>
            <p className="text-muted-foreground mt-2">{getErrorMessage()}</p>
          </div>

          <div className="space-y-4">
            <Button asChild variant="glass-primary" className="w-full rounded-[10px]">
              <Link href="/auth/login" className="flex justify-center">Back to Login</Link>
            </Button>
            <Button asChild variant="glass" className="w-full rounded-[10px]">
              <Link href="/auth/register" className="flex justify-center">Create Account</Link>
            </Button>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
