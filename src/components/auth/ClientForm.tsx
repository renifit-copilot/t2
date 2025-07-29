'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ClientForm() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        body: JSON.stringify({ code }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.success) {
        // SSR редирект через window.location
        const paths = {
          student: '/student-dashboard',
          mentor: '/mentor-dashboard',
          teacher: '/teacher-dashboard',
        } as const;
        
        const redirectPath = paths[data.role as keyof typeof paths];

        if (redirectPath) {
          window.location.href = redirectPath;
        }
      }
    } catch (err) {
      setError('Произошла ошибка при проверке кода');
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
