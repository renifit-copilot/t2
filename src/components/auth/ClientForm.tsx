'use client';

import { useEffect, useState } from 'react';
import { useRawInitData } from '@telegram-apps/sdk-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ClientForm() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false); // 👈 Управляем показом формы

  const initDataRaw = useRawInitData();

  // 🚀 Автоавторизация при наличии initData
  useEffect(() => {
    const tryAutoLogin = async () => {
      if (!initDataRaw) return;

      try {
        const res = await fetch('/api/validate', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: initDataRaw }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          const paths = {
            student: '/student-dashboard',
            mentor: '/mentor-dashboard',
            teacher: '/teacher-dashboard',
          } as const;

          window.location.href = paths[data.role as keyof typeof paths];
        } else {
          // ❗ Пользователь не найден — показать форму
          setShowForm(true);
        }
      } catch {
        setShowForm(true);
      }
    };

    tryAutoLogin();
  }, [initDataRaw]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!initDataRaw) {
      setError('Нет initData из Telegram');
      setLoading(false);
      return;
    }

    if (!code.trim()) {
      setError('Введите код доступа');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, initData: initDataRaw }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.success) {
        const paths = {
          student: '/student-dashboard',
          mentor: '/mentor-dashboard',
          teacher: '/teacher-dashboard',
        } as const;

        const redirectPath = paths[data.role as keyof typeof paths];
        window.location.href = redirectPath;
      }
    } catch {
      setError('Произошла ошибка при проверке кода');
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) return null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center p-4 gap-4">
      <div className="space-y-2 w-full max-w-xs">
        <Input
          type="text"
          placeholder="Введите код доступа"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={loading}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Проверка...' : 'Подтвердить'}
        </Button>
      </div>
    </form>
  );
}
