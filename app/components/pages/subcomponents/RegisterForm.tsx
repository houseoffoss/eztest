import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { Label } from '@/frontend/reusable-elements/labels/Label';
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
    <form onSubmit={onSubmit} className="space-y-3.5">
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center gap-2">
            <span>❌</span>
            <span>{error}</span>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name" className="text-white/80">Name</Label>
        <Input
          id="name"
          type="text"
          required
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            onFormDataChange({ ...formData, name: e.target.value })
          }
          onBlur={() => onFieldBlur?.('name')}
          placeholder="Enter your name"
          className={`h-10 bg-transparent border-white/10 rounded-full px-5 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all ${
            fieldErrors.name ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50' : ''
          }`}
        />
        {fieldErrors.name && (
          <p className="text-xs text-red-400 mt-1 pl-2">{fieldErrors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white/80">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            onFormDataChange({ ...formData, email: e.target.value })
          }
          onBlur={() => onFieldBlur?.('email')}
          placeholder="abc@gmail.com"
          className={`h-10 bg-transparent border-white/10 rounded-full px-5 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all ${
            fieldErrors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50' : ''
          }`}
        />
        {fieldErrors.email && (
          <p className="text-xs text-red-400 mt-1 pl-2">{fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white/80">Password</Label>
        <Input
          id="password"
          type="password"
          required
          value={formData.password}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            onFormDataChange({ ...formData, password: e.target.value })
          }
          onBlur={() => onFieldBlur?.('password')}
          placeholder="****************"
          className={`h-10 bg-transparent border-white/10 rounded-full px-5 text-white placeholder:text-white/30 tracking-widest focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all ${
            fieldErrors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50' : ''
          }`}
        />
        {fieldErrors.password && (
          <p className="text-xs text-red-400 mt-1 pl-2">{fieldErrors.password}</p>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <Label htmlFor="confirmPassword" className="text-white/80">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          required
          value={formData.confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            onFormDataChange({ ...formData, confirmPassword: e.target.value })
          }
          onBlur={() => onFieldBlur?.('confirmPassword')}
          placeholder="****************"
          className={`h-10 bg-transparent border-white/10 rounded-full px-5 text-white placeholder:text-white/30 tracking-widest focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all ${
            fieldErrors.confirmPassword ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50' : ''
          }`}
        />
        {fieldErrors.confirmPassword && (
          <p className="text-xs text-red-400 mt-1 pl-2">{fieldErrors.confirmPassword}</p>
        )}
      </div>

      <div className="flex justify-center pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors relative group overflow-hidden flex items-center justify-center font-medium"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
          {isLoading ? (
            <span className="text-white/70">Creating account...</span>
          ) : (
            <span className="text-white">Create <span className="text-[#3291FF]">Account</span></span>
          )}
        </button>
      </div>
    </form>
  );
};
