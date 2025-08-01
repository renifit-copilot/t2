'use client';

import { useEffect, useState } from 'react';
import { FeedbackCard } from '@/components/feedback/FeedbackCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Feedback = {
  id: number;
  mentorName: string;
  comment: string;
  rating: number;
  date: string;
};

export default function FeedbackHistoryPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/feedback/own')
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then((data) => setFeedbacks(data || []))
      .catch(() => setError('Не удалось загрузить отзывы'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-6 text-center">История отзывов</h1>

      <div className="text-center mb-6">
        <Link href="/student-dashboard">
          <Button variant="outline">Назад к форме</Button>
        </Link>
      </div>

      {loading && <p className="text-center text-muted-foreground">Загрузка...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && feedbacks.length === 0 && (
        <p className="text-center text-muted-foreground">Вы ещё не оставляли отзывов.</p>
      )}

      <div className="space-y-4">
        {feedbacks.map((fb) => (
          <FeedbackCard key={fb.id} feedback={fb} />
        ))}
      </div>
    </div>
  );
}
