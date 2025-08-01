import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { feedback, users } from '@/db/schema';
import { and, eq, gte, lte, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get('role')?.value;
    const tgId = cookieStore.get('tgId')?.value;

    if (role !== 'teacher' || !tgId) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const mentorId = searchParams.get('mentorId');
    const groupCode = searchParams.get('groupCode');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const conditions = [];

    if (mentorId) {
      conditions.push(eq(feedback.mentorId, mentorId));
    }

    if (groupCode) {
      conditions.push(eq(feedback.groupCode, groupCode));
    }

    if (from) {
      const fromDate = new Date(from);
      if (!isNaN(fromDate.getTime())) {
        conditions.push(gte(feedback.createdAt, fromDate));
      }
    }

    if (to) {
      const toDate = new Date(to);
      if (!isNaN(toDate.getTime())) {
        conditions.push(lte(feedback.createdAt, toDate));
      }
    }

    const result = await db
      .select({
        id: feedback.id,
        studentName: users.fullName,
        mentorName: users.fullName,
        rating: feedback.rating,
        comment: feedback.comment,
        groupCode: feedback.groupCode,
        date: feedback.createdAt,
      })
      .from(feedback)
      .leftJoin(users, eq(feedback.mentorId, users.telegramId))
      .where(and(...conditions))
      .orderBy(desc(feedback.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Ошибка в GET /api/feedback:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
