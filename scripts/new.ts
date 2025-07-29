import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import {
  users,
  mentorAssignments,
} from '../src/db/schema'; // путь укажи свой, если другой

// 💡 Укажи свою строку подключения
const pool = new Pool({
  connectionString: 'postgres://postgres:Ds22052005@localhost:5432/telegram_mentors',
});

const db = drizzle(pool);

async function seed() {
  // Очистим таблицы
  await db.delete(mentorAssignments);
  await db.delete(users);

  // Добавим ментора
  await db.insert(users).values({
    telegramId: '7770001',
    fullName: 'Иван Тестович',
    username: 'ivantest',
    role: 'mentor',
  });

  // Добавим студента
  await db.insert(users).values({
    telegramId: '7770002',
    fullName: 'Студент Степанов',
    username: 'stepanov',
    role: 'student',
    groupCode: 'group-1',
  });

  // Назначим ментора на 3 дня
  await db.insert(mentorAssignments).values({
    mentorId: '7770001',
    groupCode: 'group-1',
    fromDate: new Date(),
    toDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  });

  console.log('✅ Seed complete');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
