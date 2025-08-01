import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get('role')?.value;

    if (role !== 'student' && role !== 'teacher') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    // Получаем всех активных менторов
    const mentors = await db
      .select({
        mentorId: users.telegramId,
        name: users.fullName,
      })
      .from(users)
      .where(eq(users.role, 'mentor'));

    return NextResponse.json(mentors);
  } catch (error) {
    console.error('Ошибка при получении менторов:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
