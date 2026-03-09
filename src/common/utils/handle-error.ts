import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new BadRequestException({
          message: 'Запись с такими данными уже существует',
          data: null,
        });
      case 'P2003':
        throw new BadRequestException({
          message: 'Невозможно выполнить операцию из-за связанных данных',
          data: null,
        });
      case 'P2025':
        throw new NotFoundException({
          message: 'Запись не найдена',
          data: null,
        });
      default:
        throw new BadRequestException({
          message: `Ошибка базы данных: ${error.code}`,
          data: null,
        });
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new BadRequestException({
      message: 'Некорректные данные запроса',
      data: null,
    });
  }

  throw new InternalServerErrorException({
    message: 'Внутренняя ошибка сервера',
    data: null,
  });
}
