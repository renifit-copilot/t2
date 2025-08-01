import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { feedback, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get('role')?.value;
    const tgId = cookieStore.get('tgId')?.value;

    if (role !== 'student' || !tgId) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    const result = await db
      .select({
        id: feedback.id,
        mentorName: users.fullName,
        comment: feedback.comment,
        rating: feedback.rating,
        date: feedback.createdAt,
      })
      .from(feedback)
      .leftJoin(users, eq(feedback.mentorId, users.telegramId))
      .where(eq(feedback.studentId, tgId))
      .orderBy(desc(feedback.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Ошибка в feedback/own:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
