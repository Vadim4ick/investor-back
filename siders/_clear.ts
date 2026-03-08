import { prisma } from './../prisma/client';

export async function clearDatabase() {
  console.log('Clearing tables...');

  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
}
