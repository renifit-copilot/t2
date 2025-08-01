import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { feedback, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const numId = Number(id);

  if (Number.isNaN(numId)) {
    return NextResponse.json({ error: 'Некорректный ID' }, { status: 400 });
  }

  const rows = await db
    .select({
      id: feedback.id,
      mentorName: users.fullName,
      rating: feedback.rating,
      comment: feedback.comment,
      date: feedback.createdAt,
    })
    .from(feedback)
    .leftJoin(users, eq(feedback.mentorId, users.telegramId))
    .where(eq(feedback.id, numId));

  if (!rows[0]) {
    return NextResponse.json({ error: 'Отзыв не найден' }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}
