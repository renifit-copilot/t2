'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRawInitData } from '@telegram-apps/sdk-react';
import { useAuth } from '@/hooks/useAuth';

export default function EnterCodePage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { loading: authLoading, role } = useAuth();
  const initDataRaw = useRawInitData();

  // Если пользователь уже авторизован, редиректим его
  useEffect(() => {
    if (!authLoading && role) {
      switch (role) {
        case 'student':
          router.push('/student-dashboard');
          break;
        case 'mentor':
          router.push('/mentor-dashboard');
          break;
        case 'teacher':
          router.push('/teacher-dashboard');
          break;
      }
    }
  }, [authLoading, role, router]);

  const isReady = typeof initDataRaw === 'string' && initDataRaw.length > 0;

  if (!isReady || authLoading) {
    return (
      <div className="flex flex-col items-center p-4 gap-4">
        <p className="text-sm text-gray-500">Загрузка...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        body: JSON.stringify({ initData: initDataRaw, code }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.success) {
        // Сохраняем в localStorage
        localStorage.setItem('auth', JSON.stringify({
          role: data.role,
          groupCode: data.groupCode
        }));

        // Редиректим на нужную страницу
        switch (data.role) {
          case 'student':
            router.push('/student-dashboard');
            break;
          case 'mentor':
            router.push('/mentor-dashboard');
            break;
          case 'teacher':
            router.push('/teacher-dashboard');
            break;
        }
      }
    } catch (err) {
      setError('Произошла ошибка при проверке кода');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
