import { prisma } from './../prisma/client';

export async function clearDatabase() {
  console.log('Clearing tables...');

  await prisma.$executeRaw`
    TRUNCATE TABLE "Transaction", "Category", "User"
    RESTART IDENTITY CASCADE;
  `;
}
