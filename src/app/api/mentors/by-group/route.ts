import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { users, mentorAssignments } from '@/db/schema';
import { and, eq, gte, lte, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // 1. Проверка авторизации и получение роли
    const cookieStore = await cookies();
    const role = cookieStore.get('role')?.value;

    if (role !== 'student' && role !== 'teacher') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    // 2. Получение и валидация groupCode
    const { searchParams } = new URL(request.url);
    let groupCode: string | undefined;

    if (role === 'student') {
      groupCode = cookieStore.get('groupCode')?.value;
    } else {
      groupCode = searchParams.get('groupCode') || cookieStore.get('groupCode')?.value;
    }

    if (!groupCode) {
      return NextResponse.json(
        { error: 'Параметр groupCode обязателен' },
        { status: 400 }
      );
    }

    // 3. Обработка даты (UTC+5 и обрезка до начала дня)
    const dateParam = searchParams.get('date');
    let targetDate: Date;

    if (dateParam) {
      const date = new Date(dateParam);
      if (isNaN(date.getTime())) {
        return NextResponse.json({ error: 'Неверный формат даты' }, { status: 400 });
      }
      targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    } else {
      const now = new Date();
      const utc5Offset = 5 * 60 * 60 * 1000;
      const localDate = new Date(now.getTime() + utc5Offset);
      targetDate = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
    }

    // 4. Логика API: поиск назначений
    const assignments = await db
      .select({
        mentorId: mentorAssignments.mentorId,
      })
      .from(mentorAssignments)
      .where(
        and(
          eq(mentorAssignments.groupCode, groupCode),
          lte(mentorAssignments.fromDate, targetDate),
          gte(mentorAssignments.toDate, targetDate)
        )
      );

    if (assignments.length === 0) {
      return NextResponse.json([]);
    }

    const mentorIds = assignments.map((a) => a.mentorId);

    // 5. Получение информации о менторах
    const mentors = await db
      .select({
        mentorId: users.telegramId,
        name: users.fullName,
      })
      .from(users)
      .where(inArray(users.telegramId, mentorIds));

    // 6. Возвращаем результат
    return NextResponse.json(mentors);

  } catch (error) {
    console.error('Ошибка при получении менторов:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
