'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ResetSessionButton from '@/components/ResetSessionButton';


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { FeedbackCard } from '@/components/feedback/FeedbackCard'; // импорт карточки

type Mentor = {
  mentorId: string;
  name: string;
};

type Feedback = {
  id: number;
  mentorName: string;
  comment: string;
  rating: number;
  date: string;
};

function FeedbackForm({ mentors }: { mentors: Mentor[] }) {
  const [mentorId, setMentorId] = useState<string>('');
  const [rating, setRating] = useState<string>('');
  const [comment, setComment] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    if (!mentorId || !rating) {
      setError('Пожалуйста, выберите ментора и поставьте оценку.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/feedback/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mentorId,
          rating: parseInt(rating, 10),
          comment,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Произошла неизвестная ошибка');
      }

      setSuccess('Отзыв успешно отправлен! Страница будет перезагружена.');

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  if (mentors.length === 0) {
    return (
      <div className="text-center text-gray-500">
        На сегодня нет доступных менторов.
        <ResetSessionButton />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto flex flex-col gap-4">
      {/* Mentor select */}
      <div>
        <label htmlFor="mentor-select" className="block text-sm font-medium text-gray-700 mb-1">
          Выберите ментора
        </label>
        <Select onValueChange={setMentorId} value={mentorId}>
          <SelectTrigger id="mentor-select">
            <SelectValue placeholder="Ментор" />
          </SelectTrigger>
          <SelectContent>
            {mentors.map((mentor) => (
              <SelectItem key={mentor.mentorId} value={mentor.mentorId}>
                {mentor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rating select */}
      <div>
        <label htmlFor="rating-select" className="block text-sm font-medium text-gray-700 mb-1">
          Оценка
        </label>
        <Select onValueChange={setRating} value={rating}>
          <SelectTrigger id="rating-select">
            <SelectValue placeholder="Рейтинг от 1 до 5" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5].map((r) => (
              <SelectItem key={r} value={String(r)}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Comment */}
      <div>
        <label htmlFor="comment-textarea" className="block text-sm font-medium text-gray-700 mb-1">
          Комментарий
        </label>
        <Textarea
          id="comment-textarea"
          placeholder="Ваш отзыв..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">{success}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
      </Button>
    </form>
  );
}

// ---------- Главный компонент страницы ----------
export default function StudentDashboardPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [lastFeedback, setLastFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mentorsRes = await fetch('/api/mentors/by-group');
        const mentorsData = await mentorsRes.json();
        setMentors(mentorsData);

        const feedbackRes = await fetch('/api/feedback/last');
        const feedbackData = await feedbackRes.json();
        setLastFeedback(feedbackData);
      } catch (err: any) {
        setError('Ошибка при загрузке данных');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Оставить отзыв</h1>

      {isLoading && <p className="text-center">Загрузка...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!isLoading && !error && (
        <>
          <FeedbackForm mentors={mentors} />

          {lastFeedback && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold mb-2 text-center">Ваш последний отзыв</h2>
              <FeedbackCard feedback={lastFeedback} />
            </div>
          )}

                    <div className="text-center mt-6">
            <Link href="/student-dashboard/history">
              <Button variant="outline">История отзывов</Button>
            </Link>
          </div>
        </>
      )}

    </div>
  );
}
