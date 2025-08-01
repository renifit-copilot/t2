'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type Feedback = {
  id: number;
  mentorName: string;
  rating: number;
  comment: string;
  date: string;
};

type Props = {
  feedback: Feedback;
};

export function FeedbackCard({ feedback }: Props) {
  const shortComment =
    feedback.comment.length > 80
      ? feedback.comment.slice(0, 80) + '...'
      : feedback.comment;

  return (
    <Link href={`/feedback/${feedback.id}`}>
      <Card className="cursor-pointer hover:bg-muted transition w-full max-w-md mx-auto">
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-primary">
              Наставник: {feedback.mentorName}
            </p>
            <Badge variant="outline">Оценка: {feedback.rating}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{shortComment}</p>
          <p className="text-xs text-right text-gray-400">
            {new Date(feedback.date).toLocaleDateString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
