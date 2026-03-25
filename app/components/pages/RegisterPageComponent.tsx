'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ButtonSecondary } from '@/frontend/reusable-elements/buttons/ButtonSecondary';
import { Navbar } from '@/frontend/reusable-components/layout/Navbar';
import { RegisterForm } from './subcomponents/RegisterForm';
import { OtpVerification } from '@/frontend/reusable-components/auth/OtpVerification';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { useAnalytics } from '@/hooks/useAnalytics';
import { GlassFooter } from '@/frontend/reusable-components/layout/GlassFooter';
import { EZTestLogo } from '@/frontend/reusable-components/logo/EZTestLogo';

const navItems: Array<{ label: string; href: string }> = [];

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
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: '/screenshots/TestCase_List_Page1.png',
      title: 'Complete Control',
      description: 'Self-host on your infrastructure, own your data completely',
    },
    {
      image: '/screenshots/TestRun_List_Page.png',
      title: 'Actionable Insights',
      description: 'Get detailed reports and analytics for every test run',
    },
    {
      image: '/screenshots/Defects_List_Page.png',
      title: 'Streamlined Debugging',
      description: 'Track and manage defects with ease and precision',
    },
    {
      image: '/screenshots/Project_List_Page.png',
      title: 'Effortless Organization',
      description: 'Organize your testing projects in a structured way',
    },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

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

  if (showOtpVerification) {
    return (
      <div className="min-h-screen bg-[#050608] flex flex-col relative overflow-x-hidden">
        <OtpVerification
          email={formData.email}
          type="register"
          onVerified={handleOtpVerified}
          onCancel={handleOtpCancel}
        />
        <FloatingAlert alert={alert} onClose={() => setAlert(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] flex flex-col relative overflow-x-hidden">
      <div className="relative flex flex-col min-h-screen overflow-hidden">
        {/* Blurred orange glow over grid */}
        <div className="hero-grid-glow absolute inset-0 z-0 pointer-events-none" aria-hidden="true" />

        {/* Grid image layer */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[280px] sm:h-[350px] md:h-[420px] bg-[url('/Grid.png')] bg-top bg-no-repeat bg-[length:min(1600px,100vw)_auto]"
          style={{ transform: 'translateY(25%)' }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col flex-1">
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
                  <EZTestLogo width={24} height={24} patternId="pattern-register-logo" />
                </div>
              </div>
            }
            items={navItems}
            breadcrumbs={null}
            actions={
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <div 
                    className="inline-flex items-center relative rounded-[100px] transition-all cursor-pointer"
                    style={{
                      height: '52px',
                      backgroundColor: 'rgba(51, 51, 51, 0.10)',
                      paddingTop: '6px',
                      paddingRight: '10px',
                      paddingBottom: '6px',
                      paddingLeft: '10px',
                      gap: '10px',
                      backdropFilter: 'blur(40px)',
                      boxShadow: '0 10px 30px -12px rgba(0, 0, 0, 0.6)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(51, 51, 51, 0.32)';
                      e.currentTarget.style.boxShadow = '0 18px 45px -18px rgba(0, 0, 0, 0.95)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(51, 51, 51, 0.10)';
                      e.currentTarget.style.boxShadow = '0 10px 30px -12px rgba(0, 0, 0, 0.6)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div
                      className="absolute -inset-[1px] rounded-[100px] pointer-events-none -z-10"
                      style={{
                        background: 'conic-gradient(from 305deg, rgba(255, 255, 255, 0.4) 0deg, rgba(255, 255, 255, 0.4) 80deg, rgba(255, 255, 255, 0.05) 125deg, rgba(255, 255, 255, 0.4) 145deg, rgba(255, 255, 255, 0.4) 280deg, rgba(255, 255, 255, 0.05) 300deg, rgba(255, 255, 255, 0.4) 357deg)',
                        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        maskComposite: 'exclude',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        padding: '1px',
                      }}
                    />
                    <span 
                      className="relative z-10 px-4 py-2 transition-colors cursor-pointer"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '23.33px',
                        letterSpacing: '0.29px',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        background: 'linear-gradient(94.37deg, #D97F4C 11.75%, #734328 88.32%)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                      }}
                    >
                      Sign in
                    </span>
                  </div>
                </Link>
              </div>
            }
          />
          {/* Top Centered Content - Reduced padding to move content up */}
          <div className="w-full text-center px-4 max-w-3xl mx-auto pt-2 pb-1">
            <h2 
              className="font-semibold text-[20px] leading-none tracking-normal mb-4 flex justify-center"
              style={{ 
                color: '#0B63FF',
                filter: 'drop-shadow(0px 3.2px 3.2px rgba(0, 0, 0, 0.15))',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              EZTest
            </h2>
            <h1 
              className="mb-3 text-[40px] font-semibold leading-[52px] tracking-[0.2px] text-white"
              style={{ 
                filter: 'drop-shadow(0px 4.66px 4.66px rgba(0, 0, 0, 0.15))',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Start Testing Smarter
            </h1>
            <p 
              className="max-w-xl mx-auto text-white font-medium text-[16px] leading-[28px] tracking-normal"
              style={{ 
                filter: 'drop-shadow(0px 4.66px 4.66px rgba(0, 0, 0, 0.15))',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Join teams who have simplified their test management.
              <br className="hidden sm:block" />
              No credit card required, start for free today.
            </p>
          </div>

          {/* Split container: Left content, Right form - Shifted more Left */}
          <div className="flex flex-col lg:flex-row flex-1 max-w-[1240px] mx-auto w-full px-4 sm:px-6 lg:px-12 gap-4 lg:gap-20 items-center lg:items-start justify-start pb-4 overflow-hidden">
            <div className="w-full lg:w-[52%] flex flex-col items-start">
              <div className="relative w-full max-w-xl lg:ml-[-10px] hero-tilt-perspective hidden sm:block">
                <div className="relative hero-zoom-target" style={{ '--hero-zoom': '0.85' } as React.CSSProperties}>
                  <div className="hero-window-glow" aria-hidden="true" />
                  <div className="hero-window relative group !border-none !shadow-none">
                    <div className="hero-window-topbar">
                      <div className="flex items-center gap-[5.66px]">
                        <span className="hero-window-dot bg-[#F95959]" aria-hidden="true" />
                        <span className="hero-window-dot bg-[#F8DB46]" aria-hidden="true" />
                        <span className="hero-window-dot bg-[#41CC4F]" aria-hidden="true" />
                      </div>
                    </div>
                    <div className="hero-window-content relative">
                      <div className="overflow-hidden relative w-full aspect-video">
                        <div 
                          className="flex transition-transform duration-500 ease-in-out h-full"
                          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                          {slides.map((slide, index) => (
                            <div key={index} className="min-w-full h-full relative">
                              <Image
                                src={slide.image}
                                alt={slide.title}
                                fill
                                className="object-cover select-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Carousel controls - Fixed at the bottom of the section */}
                <div className="mt-14 w-full flex flex-col items-start">
                  <div className="mb-4 text-left h-20">
                    <h3 className="font-semibold text-white text-[20px] mb-2 leading-none">{slides[currentSlide].title}</h3>
                    <p className="text-white/60 text-[16px] leading-[24px] max-w-sm">{slides[currentSlide].description}</p>
                  </div>
                  
                  <div className="flex items-center gap-6 mt-4">
                    {/* Left Arrow */}
                    <button 
                      onClick={prevSlide}
                      className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5 15L7.5 10L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    
                    {/* Dots */}
                    <div className="flex gap-3">
                      {slides.map((_, index) => (
                        <button 
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                            currentSlide === index ? 'bg-white scale-125' : 'bg-white/20'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Right Arrow */}
                    <button 
                      onClick={nextSlide}
                      className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5 5L12.5 10L7.5 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[40%] relative">
              <div className="relative z-20 w-full rounded-[16px] sm:rounded-[20.6px] border border-[#BAB8B8]/60 bg-[rgba(13,13,13,0.04)] px-4 sm:px-6 md:px-[32px] py-6 sm:py-8 md:py-[40px] backdrop-blur-2xl transition-all">
                <div className="mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2">
                  <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#FF5F57]" />
                  <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#FEBC2E]" />
                  <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#28C840]" />
                </div>
                <div className="mb-6 text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-white">Create your account</h2>
                  <p className="text-white/60 text-sm">Get started with EZTest for free</p>
                </div>
                <RegisterForm
                  formData={formData}
                  error={error}
                  fieldErrors={fieldErrors}
                  isLoading={isLoading}
                  onFormDataChange={setFormData}
                  onFieldBlur={handleFieldBlur}
                  onSubmit={handleSubmit}
                />
                <div className="mt-6 text-center">
                   <p className="text-xs text-white/50">
                      Already have an account? <Link href="/auth/login" className="text-white hover:text-blue-400 transition-colors">Sign in</Link>
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-20 bg-[#050608] border-t border-white/5">
        <GlassFooter />
      </div>
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />
    </div>
  );
}
