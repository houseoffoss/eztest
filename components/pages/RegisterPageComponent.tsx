'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ButtonSecondary } from '@/elements/button-secondary';
import { Navbar } from '@/components/design/Navbar';
import { RegisterForm } from './subcomponents/RegisterForm';
import { RegisterLeftPanel } from './subcomponents/RegisterLeftPanel';
import { FloatingAlert, type FloatingAlertMessage } from '@/components/utils/FloatingAlert';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPageComponent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  const validateName = (name: string): string | undefined => {
    if (!name.trim()) {
      return 'Name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (name.trim().length > 50) {
      return 'Name must be less than 50 characters';
    }
    return undefined;
  };

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
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (password.length > 128) {
      return 'Password must be less than 128 characters';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return undefined;
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) {
      return 'Please confirm your password';
    }
    if (confirmPassword !== password) {
      return 'Passwords do not match';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    
    const nameError = validateName(formData.name);
    if (nameError) errors.name = nameError;
    
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;
    
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldBlur = (field: keyof typeof formData) => {
    const errors = { ...fieldErrors };
    
    if (field === 'name') {
      const error = validateName(formData.name);
      if (error) {
        errors.name = error;
        setAlert({
          type: 'error',
          title: 'Validation Error',
          message: error,
        });
      } else {
        delete errors.name;
      }
    } else if (field === 'email') {
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
      // Re-validate confirm password if it has a value
      if (formData.confirmPassword) {
        const confirmError = validateConfirmPassword(formData.confirmPassword, formData.password);
        if (confirmError) {
          errors.confirmPassword = confirmError;
        } else {
          delete errors.confirmPassword;
        }
      }
    } else if (field === 'confirmPassword') {
      const error = validateConfirmPassword(formData.confirmPassword, formData.password);
      if (error) {
        errors.confirmPassword = error;
        setAlert({
          type: 'error',
          title: 'Validation Error',
          message: error,
        });
      } else {
        delete errors.confirmPassword;
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
      // Register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Registration failed';
        setError(errorMsg);
        setAlert({
          type: 'error',
          title: 'Registration Failed',
          message: errorMsg,
        });
        setIsLoading(false);
        return;
      }

      setAlert({
        type: 'success',
        title: 'Success',
        message: 'Registration successful!',
      });

      // Auto sign in after successful registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.ok) {
        setAlert({
          type: 'success',
          title: 'Success',
          message: 'Login successful! Redirecting...',
        });
        router.push('/projects');
        router.refresh();
      } else {
        // Registration successful but login failed, redirect to login
        router.push('/auth/login?registered=true');
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
            <Link href="/auth/login">
              <ButtonSecondary className="cursor-pointer">
                Sign in
              </ButtonSecondary>
            </Link>
          </div>
        }
      />
      {/* Split container: Left content, Right form aligned to Navbar width */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-8 gap-8">
        <RegisterLeftPanel />

        {/* Right Side - Registration Form */}
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="w-full max-w-md">
            <RegisterForm
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
