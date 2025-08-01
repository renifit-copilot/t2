import { FeedbackFullCard } from '@/components/feedback/FeedbackFullCard';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function FeedbackPage({ params }: Props) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    return <p className="text-center text-red-500">Некорректный ID</p>;
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/feedback/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return <p className="text-center text-red-500">Отзыв не найден</p>;
  }

  const data = await res.json();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Полный отзыв</h1>
      <FeedbackFullCard feedback={data} />
    </div>
  );
}
