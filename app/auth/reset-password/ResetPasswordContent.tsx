'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { GlassPanel } from '@/frontend/reusable-components/layout/GlassPanel';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  // Validate token
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Токен сброса не передан');
        setValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`);
        if (response.ok) {
          setTokenValid(true);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Недействительный или просроченный токен');
        }
      } catch {
        setError('Не удалось проверить токен');
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось сбросить пароль');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#050608]">
        <div className="w-full max-w-md">
          <div className="bg-white/[0.02] border-white/10 border-2 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-8">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#050608]">
      <div className="w-full max-w-md">
        {/* Card */}
        <GlassPanel contentClassName="p-8">
          <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Создайте новый пароль</h1>
            <p className="text-white/70 text-sm">
              Введите новый пароль ниже.
            </p>
          </div>

          {success ? (
            <div className="rounded-lg p-4 text-center border border-green-500/40 bg-green-500/10">
              <h3 className="font-semibold text-green-400 mb-2 text-sm">Пароль успешно изменен</h3>
              <p className="text-green-300/90 text-sm mb-3">
                Ваш пароль изменен. Теперь вы можете войти с новым паролем.
              </p>
              <p className="text-green-300/90 text-sm">
                Переход на страницу входа...
              </p>
            </div>
          ) : !tokenValid ? (
            <div className="rounded-lg p-4 border border-red-500/40 bg-red-500/10">
              <h3 className="font-semibold text-red-400 mb-2 text-sm">Некорректная ссылка сброса</h3>
              <p className="text-red-300 text-sm mb-4">
                {error || 'Ссылка для сброса пароля недействительна или устарела.'}
              </p>
              <Link
                href="/auth/forgot-password"
                className="text-red-400 hover:text-red-300 font-semibold underline"
              >
                Запросить новую ссылку
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg p-4 border border-red-500/40 bg-red-500/10">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Новый пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setPassword(e.target.value)}
                  required
                  placeholder="Введите новый пароль (минимум 8 символов)"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Подтвердите пароль"
                />
              </div>

              {/* Password Requirements */}
              <div className="rounded-lg p-3 text-sm border border-primary/30 bg-primary/5">
                <p className="font-semibold mb-2 text-white">Требования к паролю:</p>
                <ul className="list-disc list-inside space-y-1 text-white/70">
                  <li>Не менее 8 символов</li>
                  <li>Должен совпадать в обоих полях</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <ButtonPrimary
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Сбрасываем пароль...' : 'Сбросить пароль'}
                </ButtonPrimary>
              </div>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              <Link href="/auth/login" className="text-primary hover:text-accent font-semibold transition-colors">
                Назад ко входу
              </Link>
            </p>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

export default function ResetPasswordContent() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white/[0.02] border-white/10 border-2 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-8">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

