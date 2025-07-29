import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { eq, and, sql } from 'drizzle-orm';
import { feedback, slots, users } from '@/db/schema';

// Схема валидации входных данных
const createFeedbackSchema = z.object({
  mentorId: z.number(),
  rating: z.number().min(1).max(5),
  text: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    // Проверяем роль пользователя
    const cookiesStore = await cookies();
    const role = cookiesStore.get('role')?.value;
    const tgId = cookiesStore.get('tgId')?.value;
    const groupCode = cookiesStore.get('groupCode')?.value;

    if (!role || role !== 'student' || !tgId || !groupCode) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    // Парсим и валидируем входные данные
    const body = await request.json();
    const result = createFeedbackSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Неверные данные запроса' },
        { status: 400 }
      );
    }

    const { mentorId, rating, text } = result.data;

    // Получаем ID студента
    const student = await db.query.users.findFirst({
      where: eq(users.telegramId, tgId),
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Студент не найден' },
        { status: 400 }
      );
    }

    // Проверяем, назначен ли ментор на группу сегодня
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mentorSlot = await db.query.slots.findFirst({
      where: and(
        eq(slots.mentorId, mentorId),
        eq(slots.groupCode, groupCode),
        sql`DATE(${slots.date}) = DATE(${today})`
      ),
    });

    if (!mentorSlot) {
      return NextResponse.json(
        { error: 'Ментор не назначен на вашу группу сегодня' },
        { status: 400 }
      );
    }

    // Проверяем, нет ли уже отзыва от этого студента этому ментору сегодня
    const existingFeedback = await db.query.feedback.findFirst({
      where: and(
        eq(feedback.studentId, student.id),
        eq(feedback.slotId, mentorSlot.id)
      ),
    });

    if (existingFeedback) {
      return NextResponse.json(
        { error: 'Вы уже оставили отзыв этому ментору сегодня' },
        { status: 400 }
      );
    }

    // Создаем отзыв
    await db.insert(feedback).values({
      studentId: student.id,
      slotId: mentorSlot.id,
      rating: rating,
      comment: text,
    });

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
