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

    if (role !== 'mentor' || !tgId) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    const result = await db
      .select({
        id: feedback.id,
        studentName: users.fullName,
        rating: feedback.rating,
        comment: feedback.comment,
        date: feedback.createdAt,
      })
      .from(feedback)
      .leftJoin(users, eq(feedback.studentId, users.telegramId))
      .where(eq(feedback.mentorId, tgId))
      .orderBy(desc(feedback.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Ошибка в feedback/for-mentor:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
