import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const dashboardMap = {
  student: '/student-dashboard',
  mentor: '/mentor-dashboard',
  teacher: '/teacher-dashboard',
} as const;

function checkRouteAccess(path: string, role?: string | null): boolean {
  if (!role) return false;

  if (path.startsWith('/student-dashboard') && role === 'student') return true;
  if (path.startsWith('/mentor-dashboard') && role === 'mentor') return true;
  if (path.startsWith('/teacher-dashboard') && role === 'teacher') return true;

  if (path.startsWith('/feedback') || path.startsWith('/rate')) {
    return ['student', 'mentor', 'teacher'].includes(role);
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Пропускаем внутренние ресурсы Next.js
  if (pathname.startsWith('/_next') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  const role = request.cookies.get('role')?.value;
  const tgId = request.cookies.get('tgId')?.value;
  const initData = searchParams.get('initData');

  // 1. Пользователь уже авторизован — перенаправим на дашборд, если он на / или /enter-code
  if ((pathname === '/' || pathname === '/enter-code') && role && tgId) {
    const dashboard = dashboardMap[role as keyof typeof dashboardMap] ?? '/enter-code';
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  // 2. Пользователь на защищённой странице — проверим доступ
  const hasAccess = role && tgId && checkRouteAccess(pathname, role);
  if (hasAccess) {
    return NextResponse.next();
  }

  // 3. Пользователь не авторизован или доступ запрещён — редирект на /enter-code
  const redirectUrl = new URL('/enter-code', request.url);
  const response = NextResponse.redirect(redirectUrl);


  // // 4. Если впервые пришёл initData — сохраним временно в куку
  // if (initData) {
  //   response.cookies.set('tempInitData', initData, {
  //     path: '/',
  //     httpOnly: true,
  //     secure: true,
  //     sameSite: 'strict',
  //     maxAge: 60 * 5, // 5 минут
  //   });
  // }

  return response;
}

export const config = {
  matcher: [
    '/',
    '/student-dashboard', '/student-dashboard/:path*',
    '/mentor-dashboard', '/mentor-dashboard/:path*',
    '/teacher-dashboard', '/teacher-dashboard/:path*',
    '/feedback', '/feedback/:path*',
    '/rate', '/rate/:path*',
  ],
};
