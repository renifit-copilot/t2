import { db } from '@/db';
import { accessCodes } from '@/db/schema';
import 'dotenv/config';

async function seed() {
  await db.insert(accessCodes).values([
    {
      code: 'abc123',
      role: 'student',
      groupCode: 'group-1',
    },
    {
      code: 'mentor42',
      role: 'mentor',
      groupCode: 'group-1',
    },
  ]);
  console.log('✅ Access codes inserted');
}

seed();
