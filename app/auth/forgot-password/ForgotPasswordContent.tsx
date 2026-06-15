'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { GlassPanel } from '@/frontend/reusable-components/layout/GlassPanel';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';

export default function ForgotPasswordPage() {
  const [formData, setFormData, clearFormData] = useFormPersistence('forgot-password-form', {
    email: '',
  }, {
    expiryMs: 60 * 60 * 1000, // 1 hour
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Не удалось отправить письмо для сброса';
        setError(errorMessage);
        setAlert({
          type: 'error',
          title: 'Не удалось отправить ссылку',
          message: errorMessage,
        });
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setSuccess(true);
      setAlert({
        type: 'success',
        title: 'Ссылка отправлена',
        message: data.message || 'Инструкции по сбросу пароля отправлены на вашу почту.',
      });
      clearFormData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      if (!alert) {
        setAlert({
          type: 'error',
          title: 'Ошибка',
          message: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#050608]">
      <div className="w-full max-w-md">
        {/* Card */}
        <GlassPanel contentClassName="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Сброс пароля</h1>
            <p className="text-white/70 text-sm">
              Введите email, и мы отправим ссылку для сброса пароля.
            </p>
          </div>

          {success ? (
            <div className="rounded-lg p-4 mb-6 border border-green-500/40 bg-green-500/10">
              <h3 className="font-semibold text-green-400 mb-2 text-sm">Проверьте почту</h3>
              <p className="text-green-300/90 text-sm mb-3">
                Мы отправили ссылку для сброса пароля на <strong>{formData.email}</strong>.
                Откройте письмо и перейдите по ссылке.
              </p>
              <p className="text-green-300/90 text-sm mb-3">
                Ссылка действует 1 час по соображениям безопасности.
              </p>
              <p className="text-green-300/90 text-sm">
                Не получили письмо? Проверьте спам или{' '}
                <button
                  onClick={() => setSuccess(false)}
                  className="font-semibold text-green-400 hover:text-green-300 underline"
                >
                  попробуйте снова
                </button>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg p-4 border border-red-500/40 bg-red-500/10">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  placeholder="you@example.com"
                />
              </div>

              <ButtonPrimary
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Отправка...' : 'Отправить ссылку'}
              </ButtonPrimary>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Вспомнили пароль?{' '}
              <Link href="/auth/login" className="text-primary hover:text-accent font-semibold transition-colors">
                Назад ко входу
              </Link>
            </p>
          </div>
        </GlassPanel>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-white/50">
          <p>Если нужна помощь, обратитесь в поддержку.</p>
        </div>
      </div>

      {/* Floating Alert */}
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />
    </div>
  );
}

