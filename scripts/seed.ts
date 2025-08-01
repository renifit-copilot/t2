import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { accessCodes } from '@/db/schema';

// 🔐 Прямо тут прописываешь строку подключения (без .env)
const pool = new Pool({
  connectionString: 'postgres://postgres:Ds22052005@localhost:5432/telegram_mentors',
});

const db = drizzle(pool);

async function seed() {
  await db.insert(accessCodes).values([
    {
      code: 'abc123',
      role: 'student',
      groupCode: 'group-1',
    },    {
      code: 'abc223',
      role: 'student',
      groupCode: 'group-2',
    },
    {
      code: 'mentor42',
      role: 'mentor',
      groupCode: 'group-1',
    },
      {
    code: 'teach2024',
    role: 'teacher',
    groupCode: 'main', // можно поставить любое значение, даже просто 'main'
  },
  ]);

  console.log('✅ Access codes inserted');
}

seed();
