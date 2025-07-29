import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTelegramInitData } from '@/core/telegram/validateInitData';

// Функция проверки прав доступа к маршруту
function checkRouteAccess(path: string, role?: string | null): boolean {
  if (!role) return false;

  // Проверяем доступ к специфическим маршрутам
  if (path.startsWith('/student-dashboard') && role === 'student') return true;
  if (path.startsWith('/mentor-dashboard') && role === 'mentor') return true;
  if (path.startsWith('/teacher-dashboard') && role === 'teacher') return true;
  
  // Для общих маршрутов достаточно наличия любой роли
  if (path.startsWith('/feedback') || path.startsWith('/rate')) {
    return ['student', 'mentor', 'teacher'].includes(role);
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Получаем куки
  const role = request.cookies.get('role')?.value;
  const tgId = request.cookies.get('tgId')?.value;

  // Если есть куки и роль подходит для маршрута - пропускаем
  if (role && tgId && checkRouteAccess(pathname, role)) {
    return NextResponse.next();
  }

  // Пробуем получить initData из URL
  const searchParams = request.nextUrl.searchParams;
  const initData = searchParams.get('tgWebAppData');

  if (initData) {
    try {
      const data = verifyTelegramInitData(initData);
      if (data.user?.id) {
        // В middleware мы можем только проверить валидность initData
        // Но восстановление сессии должно происходить через API
        const response = NextResponse.redirect(new URL('/api/validate', request.url));
        response.cookies.set('tempInitData', initData, { 
          httpOnly: true, 
          secure: true,
          sameSite: 'strict',
          maxAge: 5 * 60 // 5 минут
        });
        return response;
      }
    } catch {
      // Если initData невалиден - редирект на страницу ввода кода
      return NextResponse.redirect(new URL('/enter-code', request.url));
    }
  }

  // Если нет ни кук, ни initData - редирект на страницу ввода кода
  return NextResponse.redirect(new URL('/enter-code', request.url));
}

// Конфигурация путей для middleware
export const config = {
  matcher: [
    '/student-dashboard/:path*',
    '/mentor-dashboard/:path*',
    '/teacher-dashboard/:path*',
    '/feedback/:path*',
    '/rate/:path*'
  ]
};
