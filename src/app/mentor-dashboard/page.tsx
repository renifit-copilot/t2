'use client';

import { useEffect, useState } from 'react';
import { MentorFeedbackCard } from '@/components/feedback/MentorFeedbackCard';
import { Card, CardContent } from '@/components/ui/card';

type Feedback = {
  id: number;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
};

export default function MentorDashboardPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/feedback/for-mentor')
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then((data) => setFeedbacks(data || []))
      .catch(() => setError('Не удалось загрузить отзывы'))
      .finally(() => setLoading(false));
  }, []);

  const averageRating = feedbacks.length
    ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(2)
    : null;

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Мои отзывы</h1>

      {averageRating && (
        <Card className="mb-6">
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground text-sm">Средняя оценка</p>
            <p className="text-3xl font-bold text-primary">{averageRating}</p>
          </CardContent>
        </Card>
      )}

      {loading && <p className="text-center text-muted-foreground">Загрузка...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && feedbacks.length === 0 && (
        <p className="text-center text-muted-foreground">Отзывов пока нет.</p>
      )}

      <div className="space-y-4">
        {feedbacks.map((fb) => (
        <MentorFeedbackCard key={fb.id} feedback={fb} />
        ))}
      </div>
    </div>
  );
}
