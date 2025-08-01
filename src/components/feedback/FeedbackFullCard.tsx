'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Feedback = {
  id: number;
  mentorName: string;
  rating: number;
  comment: string;
  date: string;
};

export function FeedbackFullCard({ feedback }: { feedback: Feedback }) {
  return (
    <Card className="w-full max-w-md mx-auto mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Отзыв от ученика</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <p className="text-sm font-medium text-primary">
            Наставник: {feedback.mentorName}
          </p>
          <Badge variant="outline">Оценка: {feedback.rating}</Badge>
        </div>

        <div>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {feedback.comment}
          </p>
        </div>

        <p className="text-xs text-right text-gray-400">
          {new Date(feedback.date).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </p>
      </CardContent>
    </Card>
  );
}
