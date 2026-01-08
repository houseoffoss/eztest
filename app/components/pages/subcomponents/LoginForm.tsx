import Link from 'next/link';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/frontend/reusable-elements/cards/Card';
import { Alert, AlertDescription } from '@/frontend/reusable-elements/alerts/Alert';

interface FieldErrors {
  email?: string;
  password?: string;
}

interface LoginFormProps {
  formData: {
    email: string;
    password: string;
  };
  error: string;
  fieldErrors?: FieldErrors;
  isLoading: boolean;
  onFormDataChange: (data: { email: string; password: string }) => void;
  onFieldBlur?: (field: 'email' | 'password') => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const LoginForm = ({
  formData,
  error,
  fieldErrors = {},
  isLoading,
  onFormDataChange,
  onFieldBlur,
  onSubmit,
}: LoginFormProps) => {
  return (
    <>
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
          <form onSubmit={onSubmit} className="space-y-4">
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
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  onFormDataChange({ ...formData, email: e.target.value })
                }
                onBlur={() => onFieldBlur?.('email')}
                placeholder="you@company.com"
                className={fieldErrors.email ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/50 hover:border-red-500 hover:ring-2 hover:ring-red-400/30 transition-all' : ''}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-primary hover:text-accent transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  onFormDataChange({ ...formData, password: e.target.value })
                }
                onBlur={() => onFieldBlur?.('password')}
                placeholder="••••••••"
                className={fieldErrors.password ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/50 hover:border-red-500 hover:ring-2 hover:ring-red-400/30 transition-all' : ''}
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div className="flex justify-center">
              <ButtonPrimary
                type="submit"
                disabled={isLoading}
                className="w-auto px-12"
                buttonName="Login Page - Sign In"
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
              </ButtonPrimary>
            </div>
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
      <Card
        variant="glass"
        className="bg-white/[0.02] border-white/10 border-2 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] mt-6"
      >
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
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
