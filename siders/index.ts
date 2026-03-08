import { prisma } from 'prisma/client';
import { addCategories } from './categories';
import { clearDatabase } from './_clear';

async function seed() {
  await clearDatabase();
  await addCategories();
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
