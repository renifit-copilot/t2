import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { eq, and, lte, gte } from 'drizzle-orm';
import { feedback, mentorAssignments, users } from '@/db/schema';

// Схема валидации входных данных
const createFeedbackSchema = z.object({
  mentorId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1),
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

    const { mentorId, rating, comment } = result.data;

    // Проверяем, назначен ли ментор на группу сегодня
    const today = new Date();

    const assignment = await db.query.mentorAssignments.findFirst({
      where: and(
        eq(mentorAssignments.mentorId, mentorId),
        eq(mentorAssignments.groupCode, groupCode),
        lte(mentorAssignments.fromDate, today),
        gte(mentorAssignments.toDate, today)
      ),
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Ментор не назначен на вашу группу сегодня' },
        { status: 400 }
      );
    }

    // Проверяем, нет ли уже отзыва от этого студента этому ментору сегодня
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existingFeedback = await db.query.feedback.findFirst({
      where: and(
        eq(feedback.studentId, tgId),
        eq(feedback.mentorId, mentorId),
        gte(feedback.createdAt, todayStart)
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
      studentId: tgId,
      mentorId: mentorId,
      groupCode: groupCode,
      rating: rating,

      comment: comment,
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
