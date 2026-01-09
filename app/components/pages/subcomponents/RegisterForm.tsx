import Link from 'next/link';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/frontend/reusable-elements/cards/Card';
import { Alert, AlertDescription } from '@/frontend/reusable-elements/alerts/Alert';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface RegisterFormProps {
  formData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  error: string;
  fieldErrors?: FieldErrors;
  isLoading: boolean;
  onFormDataChange: (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => void;
  onFieldBlur?: (field: 'name' | 'email' | 'password' | 'confirmPassword') => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const RegisterForm = ({
  formData,
  error,
  fieldErrors = {},
  isLoading,
  onFormDataChange,
  onFieldBlur,
  onSubmit,
}: RegisterFormProps) => {
  return (
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
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onFormDataChange({ ...formData, name: e.target.value })
              }
              onBlur={() => onFieldBlur?.('name')}
              placeholder="John Doe"
              className={fieldErrors.name ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/50 hover:border-red-500 hover:ring-2 hover:ring-red-400/30 transition-all' : ''}
            />
            {fieldErrors.name && (
              <p className="text-xs text-red-400 mt-1">{fieldErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onFormDataChange({ ...formData, email: e.target.value })
              }
              onBlur={() => onFieldBlur?.('email')}
              placeholder="you@example.com"
              className={fieldErrors.email ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/50 hover:border-red-500 hover:ring-2 hover:ring-red-400/30 transition-all' : ''}
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onFormDataChange({ ...formData, password: e.target.value })
              }
              onBlur={() => onFieldBlur?.('password')}
              placeholder="••••••••"
              className={fieldErrors.password ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/50 hover:border-red-500 hover:ring-2 hover:ring-red-400/30 transition-all' : ''}
            />
            {fieldErrors.password ? (
              <p className="text-xs text-red-400 mt-1">{fieldErrors.password}</p>
            ) : (
              <p className="text-xs text-muted-foreground">At least 8 characters with uppercase, lowercase, and number</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onFormDataChange({ ...formData, confirmPassword: e.target.value })
              }
              onBlur={() => onFieldBlur?.('confirmPassword')}
              placeholder="••••••••"
              className={fieldErrors.confirmPassword ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/50 hover:border-red-500 hover:ring-2 hover:ring-red-400/30 transition-all' : ''}
            />
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-400 mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <div className="flex justify-center">
            <ButtonPrimary
              type="submit"
              disabled={isLoading}
              className="w-auto px-12"
              buttonName="Register Page - Create Account"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </ButtonPrimary>
          </div>
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
  );
};
