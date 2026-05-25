import Link from 'next/link';
import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { Label } from '@/frontend/reusable-elements/labels/Label';
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
        <Label htmlFor="email" className="text-white/80">Email address</Label>
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
          className={`h-11 bg-transparent border-[#BAB8B8]/60 rounded-full px-5 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all ${
            fieldErrors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50' : ''
          }`}
        />
        {fieldErrors.email && (
          <p className="text-xs text-red-400 mt-1 pl-2">{fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between pl-1">
          <Label htmlFor="password" className="text-white/80">Password</Label>
          <Link
            href="/auth/forgot-password"
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
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
          className={`h-11 bg-transparent border-[#BAB8B8]/60 rounded-full px-5 text-white placeholder:text-white/30 tracking-widest focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all ${
            fieldErrors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50' : ''
          }`}
        />
        {fieldErrors.password && (
          <p className="text-xs text-red-400 mt-1 pl-2">{fieldErrors.password}</p>
        )}
      </div>

      <div className="flex justify-center pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-[52px] relative rounded-[100px] transition-all flex items-center justify-center font-medium group"
          style={{
            backgroundColor: 'rgba(51, 51, 51, 0.10)',
            backdropFilter: 'blur(40px)',
            boxShadow: '0 10px 30px -12px rgba(0, 0, 0, 0.6)',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = 'rgba(51, 51, 51, 0.32)';
              e.currentTarget.style.boxShadow = '0 18px 45px -18px rgba(0, 0, 0, 0.95)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = 'rgba(51, 51, 51, 0.10)';
              e.currentTarget.style.boxShadow = '0 10px 30px -12px rgba(0, 0, 0, 0.6)';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
            <div
              className="absolute -inset-[1px] rounded-[100px] pointer-events-none z-0"
              style={{
                background: 'conic-gradient(from 339deg, rgba(255, 255, 255, 0.4) 0deg, rgba(255, 255, 255, 0.4) 70deg, rgba(255, 255, 255, 0.05) 90deg, rgba(255, 255, 255, 0.4) 120deg, rgba(255, 255, 255, 0.4) 240deg, rgba(255, 255, 255, 0.05) 270deg, rgba(255, 255, 255, 0.4) 360deg)',
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'exclude',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                padding: '1px',
              }}
            />
            {isLoading ? (
              <span className="text-white/70">Signing in...</span>
            ) : (
              <span 
                className="relative z-10 px-4 py-2 transition-colors flex items-center gap-1"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '23.33px',
                  letterSpacing: '0.29px',
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  background: 'linear-gradient(94.37deg, #3291FF 11.75%, #405998 88.32%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Sign in
              </span>
            )}
        </button>
      </div>
    </form>
  );
};
