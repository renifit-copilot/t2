// app/api/feedback/[id]/route.ts

import { db } from '@/db';
import { feedback, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Неверный ID' }, { status: 400 });
  }

  const result = await db
    .select({
      id: feedback.id,
      comment: feedback.comment,
      rating: feedback.rating,
      date: feedback.createdAt,
      mentorName: users.fullName,
      studentId: feedback.studentId,
    })
    .from(feedback)
    .innerJoin(users, eq(users.telegramId, feedback.mentorId))
    .where(eq(feedback.id, id));

  if (!result.length) {
    return NextResponse.json({ error: 'Отзыв не найден' }, { status: 404 });
  }

  return NextResponse.json(result[0]);
}
