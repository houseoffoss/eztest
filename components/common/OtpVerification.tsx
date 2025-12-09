'use client';

import { useState, useEffect, useRef } from 'react';
import { ButtonPrimary } from '@/elements/button-primary';
import { ButtonSecondary } from '@/elements/button-secondary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/elements/card';
import { Alert, AlertDescription } from '@/elements/alert';

interface OtpVerificationProps {
  email: string;
  type: 'login' | 'register';
  onVerified: () => void;
  onCancel: () => void;
}

export function OtpVerification({ email, type, onVerified, onCancel }: OtpVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setError('OTP has expired. Please request a new one.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (value && index === 5 && newOtp.every((digit) => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted data is 6 digits
    if (!/^\d{6}$/.test(pastedData)) {
      setError('Please paste a valid 6-digit OTP');
      return;
    }

    const digits = pastedData.split('');
    setOtp(digits);
    inputRefs.current[5]?.focus();
    
    // Auto-submit
    handleVerify(pastedData);
  };

  const handleVerify = async (otpValue?: string) => {
    const otpCode = otpValue || otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: otpCode,
          type,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('OTP verified successfully!');
        setTimeout(() => {
          onVerified();
        }, 500);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/otp/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          type,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('New OTP sent to your email!');
        setOtp(['', '', '', '', '', '']);
        setTimeLeft(600); // Reset timer
        setResendCooldown(60); // 1 minute cooldown
        setCanResend(false);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card variant="glass">
          <CardHeader>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-primary/20 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl mb-2">Verify Your Email</CardTitle>
              <CardDescription>
                We&apos;ve sent a 6-digit code to
                <br />
                <span className="text-primary font-medium">{email}</span>
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* OTP Input */}
            <div>
              <div className="flex gap-2 justify-center mb-4" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-background/50 border border-border rounded-lg text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isVerifying || timeLeft === 0}
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Time remaining:{' '}
                  <span className={`font-mono font-semibold ${timeLeft < 60 ? 'text-destructive' : 'text-primary'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </p>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-center">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert variant="default" className="bg-green-500/10 border-green-500/20 text-green-400">
                <AlertDescription className="text-center">{success}</AlertDescription>
              </Alert>
            )}

            {/* Buttons */}
            <div className="flex justify-center gap-3">
              <ButtonPrimary
                onClick={() => handleVerify()}
                disabled={isVerifying || otp.some((digit) => !digit) || timeLeft === 0}
                className="w-auto px-8"
              >
                {isVerifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Verifying...
                  </span>
                ) : (
                  'Verify OTP'
                )}
              </ButtonPrimary>

              <ButtonSecondary onClick={onCancel} disabled={isVerifying} className="w-auto px-8">
                Cancel
              </ButtonSecondary>
            </div>

            {/* Resend */}
            <div className="text-center pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Didn&apos;t receive the code?</p>
              <button
                onClick={handleResend}
                disabled={!canResend || isResending}
                className={`text-sm font-medium transition-colors ${
                  canResend && !isResending
                    ? 'text-primary hover:text-primary/80 cursor-pointer'
                    : 'text-muted-foreground cursor-not-allowed opacity-50'
                }`}
              >
                {isResending
                  ? 'Sending...'
                  : canResend
                    ? 'Resend OTP'
                    : `Resend in ${resendCooldown}s`}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
