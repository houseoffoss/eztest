'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ButtonSecondary } from '@/frontend/reusable-elements/buttons/ButtonSecondary';
import { Navbar } from '@/frontend/reusable-components/layout/Navbar';
import { LoginForm } from './subcomponents/LoginForm';
import { LoginLeftPanel } from './subcomponents/LoginLeftPanel';
import { OtpVerification } from '@/frontend/reusable-components/auth/OtpVerification';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { useAnalytics } from '@/hooks/useAnalytics';

const navItems: Array<{ label: string; href: string }> = [];

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginPageComponent() {
  const router = useRouter();
  const { trackButton } = useAnalytics();
  const [stars, setStars] = useState<number | null>(null);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [formData, setFormData, clearFormData] = useFormPersistence('login-form', {
    email: '',
    password: '',
  }, {
    excludeFields: ['password'], // Don't persist password for security
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
      // First, send OTP to email (also verify password)
      const otpResponse = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          type: 'login',
          password: formData.password, // Include password to verify before sending OTP
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

      // If SMTP is disabled, proceed directly to login without OTP
      if (otpData.smtpDisabled) {
        console.log('[LOGIN] SMTP disabled - proceeding with direct login');
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
        setShowOtpVerification(false);
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        // Clear form data on successful login
        clearFormData();
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
          type="login"
          onVerified={handleOtpVerified}
          onCancel={handleOtpCancel}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] flex flex-col">
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
            <div className="relative inline-flex group">
              <div
                className="absolute -inset-[1px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity -z-10"
                style={{
                  background:
                    'conic-gradient(from 45deg, rgba(255, 255, 255, 0.1) 0deg, rgba(255, 255, 255, 0.4) 90deg, rgba(255, 255, 255, 0.1) 180deg, rgba(255, 255, 255, 0.4) 270deg, rgba(255, 255, 255, 0.1) 360deg)',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  padding: '1px',
                }}
              />
              <a
                href="https://github.com/houseoffoss/eztest"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full transition-all cursor-pointer inline-flex items-center gap-2 relative z-20 group"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '100%',
                  letterSpacing: '0.2px',
                  verticalAlign: 'middle',
                }}
              >
                <div
                  className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(36px) saturate(220%)',
                    WebkitBackdropFilter: 'blur(36px) saturate(220%)',
                    zIndex: 0,
                  } as React.CSSProperties}
                />
                <span
                  className="relative z-30 flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(90deg, #F3F3F3 0%, #5C5C5C 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#5C5C5C' }}>
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>GitHub</span>
                </span>
                {stars !== null && (
                  <span className="relative z-30 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="#5C5C5C" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span
                      className="text-sm font-semibold"
                      style={{
                        background: 'linear-gradient(90deg, #F3F3F3 0%, #5C5C5C 100%)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                      }}
                    >
                      {stars.toLocaleString()}
                    </span>
                  </span>
                )}
              </a>
            </div>
            <div className="relative inline-flex group">
              <div
                className="absolute -inset-[1px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity -z-10"
                style={{
                  background:
                    'conic-gradient(from 45deg, rgba(255, 255, 255, 0.1) 0deg, rgba(255, 255, 255, 0.4) 90deg, rgba(255, 255, 255, 0.1) 180deg, rgba(255, 255, 255, 0.4) 270deg, rgba(255, 255, 255, 0.1) 360deg)',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  padding: '1px',
                }}
              />
              <Link
                href="/houseoffoss"
                className="px-4 py-2 text-sm rounded-full transition-all cursor-pointer inline-flex items-center gap-2 relative z-20 group"
                onClick={async () => {
                  await trackButton('Login Page - Self Host with House Of FOSS', { source: 'navbar' });
                }}
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '100%',
                  letterSpacing: '0.2px',
                  verticalAlign: 'middle',
                }}
              >
                <div
                  className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(36px) saturate(220%)',
                    WebkitBackdropFilter: 'blur(36px) saturate(220%)',
                    zIndex: 0,
                  } as React.CSSProperties}
                />
                <span
                  className="relative z-30 flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(90deg, #F3F3F3 0%, #5C5C5C 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
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
                </span>
              </Link>
            </div>
          </>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link href="/auth/register">
              <div 
                className="inline-flex items-center relative rounded-[100px] p-[1px] group"
                style={{
                  background: 'conic-gradient(from 339deg, rgba(255, 255, 255, 0.4) 0deg, rgba(255, 255, 255, 0.4) 70deg, rgba(255, 255, 255, 0.05) 90deg, rgba(255, 255, 255, 0.4) 120deg, rgba(255, 255, 255, 0.4) 240deg, rgba(255, 255, 255, 0.05) 270deg, rgba(255, 255, 255, 0.4) 360deg)',
                }}
              >
                <div
                  className="inline-flex items-center justify-center relative rounded-[100px] h-full w-full overflow-hidden"
                  style={{
                    height: '52px',
                    borderRadius: '100px',
                    background: 'linear-gradient(to bottom, rgba(5, 6, 8, 0.92) 0%, rgba(5, 6, 8, 0.98) 100%)',
                    paddingTop: '6px',
                    paddingRight: '10px',
                    paddingBottom: '6px',
                    paddingLeft: '10px',
                    gap: '10px',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 10px 30px -12px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none rounded-[100px]"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.06) 100%)',
                    }}
                  />
                  <span 
                    className="relative z-10 px-4 py-2 transition-colors cursor-pointer"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '21.85px',
                      letterSpacing: '0.27px',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      background: 'linear-gradient(94.37deg, #3291FF 11.75%, #405998 88.32%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    Sign up
                  </span>
                </div>
              </div>
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
