import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { feedback } from '@/db/schema';
import { eq, count, avg, gte, lte, and } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get('role')?.value;
    const tgId = cookieStore.get('tgId')?.value;

    if (role !== 'teacher' || !tgId) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where = [];

    if (from) {
      const fromDate = new Date(from);
      if (!isNaN(fromDate.getTime())) {
        where.push(gte(feedback.createdAt, fromDate));
      }
    }

    if (to) {
      const toDate = new Date(to);
      if (!isNaN(toDate.getTime())) {
        where.push(lte(feedback.createdAt, toDate));
      }
    }

    // 1. Средняя оценка по каждому ментору
    const ratingsByMentor = await db
      .select({
        mentorId: feedback.mentorId,
        avgRating: avg(feedback.rating),
        count: count(),
      })
      .from(feedback)
      .where(and(...where))
      .groupBy(feedback.mentorId);

    // 2. Общее количество отзывов
    const totalCount = await db
      .select({ count: count() })
      .from(feedback)
      .where(and(...where));

    // 3. Кол-во положительных и негативных
    const positiveCount = await db
      .select({ count: count() })
      .from(feedback)
      .where(and(...where, gte(feedback.rating, 4)));

    const negativeCount = await db
      .select({ count: count() })
      .from(feedback)
      .where(and(...where, lte(feedback.rating, 2)));

    return NextResponse.json({
      total: totalCount[0]?.count || 0,
      positive: positiveCount[0]?.count || 0,
      negative: negativeCount[0]?.count || 0,
      ratingsByMentor,
    });
  } catch (error) {
    console.error('Ошибка в /api/feedback/stats:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
