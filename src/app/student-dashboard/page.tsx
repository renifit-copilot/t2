"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Тип для ментора, чтобы было удобнее работать
type Mentor = {
  mentorId: string;
  name: string;
};

// --- Клиентский компонент для формы ---
// Он принимает список менторов, полученный на сервере
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

    // Валидация на клиенте
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
          rating: parseInt(rating, 10), // API ожидает число
          comment,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Произошла неизвестная ошибка');
      }

      setSuccess('Отзыв успешно отправлен! Страница будет перезагружена.');

      // Перезагружаем страницу через 2 секунды, чтобы пользователь успел увидеть сообщение
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
        На сегодня нет назначенных менторов для вашей группы.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto flex flex-col gap-4">
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


// --- Основной компонент страницы (SSR) ---
export default function StudentDashboardPage() {
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const response = await fetch('/api/mentors/by-group');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Не удалось загрузить список менторов');
                }
                const data = await response.json();
                setMentors(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMentors();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Оставить отзыв</h1>
            {isLoading && <p className="text-center">Загрузка менторов...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            {!isLoading && !error && <FeedbackForm mentors={mentors} />}
        </div>
    );
}