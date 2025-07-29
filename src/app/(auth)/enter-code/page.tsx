import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ClientForm } from '@/components/auth/ClientForm';

type Role = 'student' | 'mentor' | 'teacher';

export default async function EnterCodePage() {
  // Получаем cookies
  const cookieStore = await cookies();
  const role = cookieStore.get('role')?.value;
  const tgId = cookieStore.get('tgId')?.value;

  // Если пользователь авторизован - делаем SSR редирект
  if (role && tgId) {
    switch (role as Role) {
      case 'student':
        redirect('/student-dashboard');
      case 'mentor':
        redirect('/mentor-dashboard');
      case 'teacher':
        redirect('/teacher-dashboard');
    }
  }

  // Если нет авторизации - показываем форму
  return <ClientForm />;
}
