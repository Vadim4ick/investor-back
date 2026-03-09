import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/prisma.service';
import { ApiResponseBuilder } from 'src/common/utils/api-response';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { handlePrismaError } from 'src/common/utils/handle-error';
import { ApiExceptions } from 'src/common/exceptions/api.exception';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto, userId: number) {
    try {
      const transaction = await this.prisma.transaction.create({
        data: {
          ...createTransactionDto,
          userId,
        },
      });

      return ApiResponseBuilder.created(transaction);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll(userId: number) {
    try {
      const transactions = await this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return ApiResponseBuilder.success(
        'Список транзакций получен',
        transactions,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findOne(id: number, userId: number) {
    try {
      const transaction = await this.prisma.transaction.findFirst({
        where: { id, userId },
      });

      if (!transaction) {
        ApiExceptions.notFound('Транзакция не найдена');
      }

      return ApiResponseBuilder.success('Транзакция получена', transaction);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handlePrismaError(error);
    }
  }

  async update(
    id: number,
    updateTransactionDto: UpdateTransactionDto,
    userId: number,
  ) {
    try {
      const existingTransaction = await this.prisma.transaction.findFirst({
        where: { id, userId },
      });

      if (!existingTransaction) {
        ApiExceptions.notFound('Транзакция не найдена');
      }

      const transaction = await this.prisma.transaction.update({
        where: { id },
        data: updateTransactionDto,
      });

      return ApiResponseBuilder.updated(transaction);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handlePrismaError(error);
    }
  }

  async remove(id: number, userId: number) {
    try {
      const existingTransaction = await this.prisma.transaction.findFirst({
        where: { id, userId },
      });

      if (!existingTransaction) {
        ApiExceptions.notFound('Транзакция не найдена');
      }

      await this.prisma.transaction.delete({
        where: { id },
      });

      return ApiResponseBuilder.deleted();
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handlePrismaError(error);
    }
  }
}
