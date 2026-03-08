import { prisma } from './../prisma/client';

export async function addCategories() {
  console.log('Seeding categories...');

  await prisma.category.createMany({
    data: [
      { name: 'Еда' },
      { name: 'Транспорт' },
      { name: 'Жилье' },
      { name: 'Развлечения' },

      { name: 'Зарплата' },
      { name: 'Фриланс' },
    ],
  });

  console.log('Seed finished');
}
