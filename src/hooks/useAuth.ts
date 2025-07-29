import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRawInitData } from '@telegram-apps/sdk-react';

type AuthState = {
  role: 'student' | 'mentor' | 'teacher' | null;
  groupCode: string | null;
};

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthState>({ role: null, groupCode: null });

  // Загрузка состояния из localStorage только на клиенте
  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        setAuthState(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored auth state:', e);
      }
    }
  }, []);

  const router = useRouter();
  const initDataRaw = useRawInitData();

  useEffect(() => {
    async function validateAuth() {
      if (!initDataRaw) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/validate', {
          method: 'POST',
          body: JSON.stringify({ initData: initDataRaw }),
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await res.json();

        if (data.success) {
          const newState = {
            role: data.role,
            groupCode: data.groupCode || null,
          };
          
          // Сохраняем в localStorage
          localStorage.setItem('auth', JSON.stringify(newState));
          setAuthState(newState);

          // Редирект на соответствующую страницу
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
        setError('Ошибка авторизации');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    validateAuth();
  }, [initDataRaw, router]);

  const logout = () => {
    localStorage.removeItem('auth');
    setAuthState({ role: null, groupCode: null });
    router.push('/enter-code');
  };

  return {
    loading,
    error,
    role: authState.role,
    groupCode: authState.groupCode,
    logout,
  };
}
