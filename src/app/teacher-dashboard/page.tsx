'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader } from 'lucide-react';

type MentorStats = {
  mentorId: string;
  avgRating: number;
  count: number;
};

type Stats = {
  total: number;
  positive: number;
  negative: number;
  ratingsByMentor: MentorStats[];
};

export default function TeacherDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/feedback/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Ошибка при получении статистики:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader className="animate-spin w-6 h-6" />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-center text-red-500">Ошибка загрузки статистики.</p>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center mb-4">Аналитика по отзывам</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Всего отзывов</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{stats.total}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Положительные</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-green-600">
            {stats.positive}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Негативные</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-red-600">
            {stats.negative}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Средняя оценка по наставникам</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.ratingsByMentor.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет данных</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.ratingsByMentor}>
                <XAxis dataKey="mentorId" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="avgRating" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
