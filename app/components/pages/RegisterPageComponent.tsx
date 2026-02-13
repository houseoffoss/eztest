'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ButtonSecondary } from '@/frontend/reusable-elements/buttons/ButtonSecondary';
import { Navbar } from '@/frontend/reusable-components/layout/Navbar';
import { RegisterForm } from './subcomponents/RegisterForm';
import { RegisterLeftPanel } from './subcomponents/RegisterLeftPanel';
import { OtpVerification } from '@/frontend/reusable-components/auth/OtpVerification';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { useAnalytics } from '@/hooks/useAnalytics';

const navItems = [
  { label: 'Features', href: '/#features' },
  { label: 'Why Choose?', href: '/#why-choose' },
];

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPageComponent() {
  const router = useRouter();
  const { trackButton } = useAnalytics();
  const [stars, setStars] = useState<number | null>(null);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [formData, setFormData, clearFormData] = useFormPersistence('register-form', {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  }, {
    excludeFields: ['password', 'confirmPassword'], // Don't persist passwords for security
    expiryMs: 24 * 60 * 60 * 1000, // 24 hours
  });

  useEffect(() => {
    // Fetch GitHub stars count
    fetch('https://api.github.com/repos/houseoffoss/eztest')
      .then(res => res.json())
      .then(data => {
        if (data.stargazers_count !== undefined) {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {
        // Silently fail if API request fails
        setStars(null);
      });
  }, []);
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
      // First, send OTP to email
      const otpResponse = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          type: 'register',
        }),
      });

      const otpData = await otpResponse.json();

      if (!otpData.success) {
        setError(otpData.message || 'Failed to send OTP');
        setAlert({
          type: 'error',
          title: 'Error',
          message: otpData.message || 'Failed to send OTP',
        });
        setIsLoading(false);
        return;
      }

      // If SMTP is disabled, proceed directly to registration without OTP
      if (otpData.smtpDisabled) {
        console.log('[REGISTER] SMTP disabled - proceeding with direct registration');
        await handleOtpVerified();
        return;
      }

      // Show OTP verification screen
      setAlert({
        type: 'success',
        title: 'OTP Sent',
        message: 'Please check your email for the verification code',
      });
      setIsLoading(false);
      setShowOtpVerification(true);
    } catch (error) {
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

  const handleOtpVerified = async () => {
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
        setShowOtpVerification(false);
        setIsLoading(false);
        return;
      }

      setAlert({
        type: 'success',
        title: 'Success',
        message: 'Registration successful!',
      });

      // Clear form data on successful registration
      clearFormData();

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
      setShowOtpVerification(false);
      setIsLoading(false);
    }
  };

  const handleOtpCancel = () => {
    setShowOtpVerification(false);
    setIsLoading(false);
  };

  // Show OTP verification screen if needed
  if (showOtpVerification) {
    return (
      <>
        <FloatingAlert alert={alert} onClose={() => setAlert(null)} />
        <OtpVerification
          email={formData.email}
          type="register"
          onVerified={handleOtpVerified}
          onCancel={handleOtpCancel}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col">
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />
      <Navbar
        variant="marketing"
        brandLabel={
          <div 
            className="flex items-center justify-center rounded-[59.79px] backdrop-blur-2xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] p-[1px] relative transition-all"
            style={{
              width: '52px',
              height: '52px',
              background: 'conic-gradient(from 45deg, rgba(255, 255, 255, 0.1) 0deg, rgba(255, 255, 255, 0.4) 90deg, rgba(255, 255, 255, 0.1) 180deg, rgba(255, 255, 255, 0.4) 270deg, rgba(255, 255, 255, 0.1) 360deg)',
            }}
          >
            <div className="flex items-center justify-center w-full h-full rounded-[59.79px]" style={{ backgroundColor: '#050608' }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
              >
                <rect width="24" height="24" fill="url(#pattern0_105_611)" />
                <defs>
                  <pattern
                    id="pattern0_105_611"
                    patternContentUnits="objectBoundingBox"
                    width="1"
                    height="1"
                  >
                    <use
                      xlinkHref="#image0_105_611"
                      transform="scale(0.03125 0.0344828)"
                    />
                  </pattern>
                  <image
                    id="image0_105_611"
                    width="32"
                    height="29"
                    preserveAspectRatio="none"
                    xlinkHref="data:image/png;base64,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"
                  />
                </defs>
              </svg>
            </div>
          </div>
        }
        items={navItems}
        breadcrumbs={
          <>
            <a
              href="https://github.com/houseoffoss/eztest"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm rounded-full transition-colors cursor-pointer text-white/80 hover:text-white hover:bg-white/8 inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span>GitHub</span>
              {stars !== null && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-semibold">{stars.toLocaleString()}</span>
                </span>
              )}
            </a>
            <Link
              href="/houseoffoss"
              className="px-4 py-2 text-sm rounded-full transition-colors cursor-pointer text-white/80 hover:text-white hover:bg-white/8 inline-flex items-center gap-2"
              onClick={async () => {
                // Track analytics event
                await trackButton('Register Page - Self Host with House Of FOSS', { source: 'navbar' });
              }}
            >
              <span>Self host with</span>
              <Image
                src="/houseoffoss.jpg"
                alt="House Of FOSS"
                width={24}
                height={24}
                className="h-6 w-6 rounded object-cover"
              />
            </Link>
          </>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <ButtonSecondary className="cursor-pointer" buttonName="Register Page - Navbar - Sign In">
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
