'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ButtonSecondary } from '@/elements/button-secondary';
import { Navbar } from '@/components/design/Navbar';
import { LoginForm } from './subcomponents/LoginForm';
import { LoginLeftPanel } from './subcomponents/LoginLeftPanel';
import { FloatingAlert, type FloatingAlertMessage } from '@/components/utils/FloatingAlert';

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginPageComponent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  const validateEmail = (email: string): string | undefined => {
    if (!email) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldBlur = (field: 'email' | 'password') => {
    const errors = { ...fieldErrors };
    
    if (field === 'email') {
      const error = validateEmail(formData.email);
      if (error) {
        errors.email = error;
        setAlert({
          type: 'error',
          title: 'Validation Error',
          message: error,
        });
      } else {
        delete errors.email;
      }
    } else if (field === 'password') {
      const error = validatePassword(formData.password);
      if (error) {
        errors.password = error;
        setAlert({
          type: 'error',
          title: 'Validation Error',
          message: error,
        });
      } else {
        delete errors.password;
      }
    }
    
    setFieldErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      setAlert({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the validation errors before submitting',
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email.trim(),
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        const errorMsg = 'Invalid email or password';
        setError(errorMsg);
        setAlert({
          type: 'error',
          title: 'Login Failed',
          message: errorMsg,
        });
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        setAlert({
          type: 'success',
          title: 'Success',
          message: 'Login successful! Redirecting...',
        });
        router.push('/projects');
        router.refresh();
      }
    } catch {
      const errorMsg = 'An unexpected error occurred';
      setError(errorMsg);
      setAlert({
        type: 'error',
        title: 'Error',
        message: errorMsg,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col">
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />
      <Navbar
        actions={
          <div className="flex items-center gap-2">
            <Link href="/auth/register">
              <ButtonSecondary className="cursor-pointer">
                Sign up
              </ButtonSecondary>
            </Link>
          </div>
        }
      />
      {/* Split container: Left content, Right form aligned to Navbar width */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-8 gap-8">
        <LoginLeftPanel />

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="w-full max-w-md">
            <LoginForm
              formData={formData}
              error={error}
              fieldErrors={fieldErrors}
              isLoading={isLoading}
              onFormDataChange={setFormData}
              onFieldBlur={handleFieldBlur}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
