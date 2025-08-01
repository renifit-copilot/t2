'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type MentorFeedback = {
  id: number;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
};

export function MentorFeedbackCard({ feedback }: { feedback: MentorFeedback }) {
  const shortComment =
    feedback.comment.length > 80
      ? feedback.comment.slice(0, 80) + '...'
      : feedback.comment;

  return (
    <Card className="hover:bg-muted transition cursor-default">
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium">От: {feedback.studentName}</p>
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
  );
}
