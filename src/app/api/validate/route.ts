import { NextResponse } from 'next/server';
import { verifyTelegramInitData } from '@/core/telegram/validateInitData';
import { db } from '@/db';
import { users, accessCodes } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

  if (existingUser) {
    return NextResponse.json({ 
      success: true, 
      role: existingUser.role,
      groupCode: existingUser.groupCode 
    });
  }

  // Если код не предоставлен, значит это просто проверка авторизации
  if (!code) {
    return NextResponse.json({ error: 'Требуется код доступа' }, { status: 401 });
  }

  // новый пользователь — нужно ввести корректный код
  const access = await db.query.accessCodes.findFirst({
    where: (c, { eq }) => eq(c.code, code),
  });

  if (!access) {
    return NextResponse.json({ error: 'Неверный код доступа' }, { status: 401 });
  }

  if (!access) {
    return NextResponse.json({ error: 'Неверный код доступа' }, { status: 401 });
  }

  await db.insert(users).values({
    telegramId: tgId,
    username,
    fullName,
    role: access.role,
    groupCode: access.groupCode ?? null,
  });

  return NextResponse.json({ success: true, role: access.role });
}
