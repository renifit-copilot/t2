import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyTelegramInitData } from '@/core/telegram/validateInitData';
import { db } from '@/db';
import { users, accessCodes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';

export async function POST(req: Request) {
  const { initData, code } = await req.json();

  let data;
  try {
    data = verifyTelegramInitData(initData);
  } catch {
    return NextResponse.json({ error: 'Некорректный Telegram initData' }, { status: 400 });
  }

  const tgId = data.user?.id.toString();
  const username = data.user?.username || '';
  const fullName = `${data.user?.first_name || ''} ${data.user?.last_name || ''}`.trim();

  if (!tgId) return NextResponse.json({ error: 'Нет Telegram ID' }, { status: 400 });

  const existingUser = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.telegramId, tgId),
  });

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 дней
    path: '/', // 🔥 Обязателен для middleware!
  };

  if (existingUser) {
    const response = NextResponse.json({ 
      success: true, 
      role: existingUser.role,
      groupCode: existingUser.groupCode 
    });

    // Установка cookies для существующего пользователя
    response.cookies.set('role', existingUser.role, cookieOptions);
    response.cookies.set('tgId', tgId, cookieOptions);
    if (existingUser.groupCode) {
      response.cookies.set('groupCode', existingUser.groupCode, cookieOptions);
    }

    return response;
  }

  // Если код не предоставлен, значит это просто проверка авторизации
  if (!code) {
    const existingUser: InferSelectModel<typeof users> | undefined = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.telegramId, tgId),
    });
    if (!existingUser) {
      return NextResponse.json({ error: 'Пользователь не найден', tgId }, { status: 404 });
    }

    const response = NextResponse.json({
      success: true,
      role: existingUser.role,
      groupCode: existingUser.groupCode ?? null,
      tgId,
    });

    response.cookies.set('role', existingUser.role, cookieOptions);
    response.cookies.set('tgId', tgId, cookieOptions);
    if (existingUser.groupCode) {
      response.cookies.set('groupCode', existingUser.groupCode, cookieOptions);
    }

    return response;
  }


  // новый пользователь — нужно ввести корректный код
  const access = await db.query.accessCodes.findFirst({
    where: (c, { eq }) => eq(c.code, code),
  });

  if (!access) {
    return NextResponse.json({ error: 'Неверный код доступа' }, { status: 401 });
  }

  // Создаем нового пользователя
  await db.insert(users).values({
    telegramId: tgId,
    username,
    fullName,
    role: access.role,
    groupCode: access.groupCode ?? null,
  });

  const response = NextResponse.json({ 
    success: true, 
    role: access.role,
    groupCode: access.groupCode ?? null 
  });

  // Установка cookies для нового пользователя
  response.cookies.set('role', access.role, cookieOptions);
  response.cookies.set('tgId', tgId, cookieOptions);
  if (access.groupCode) {
    response.cookies.set('groupCode', access.groupCode, cookieOptions);
  }

  return response;
}
