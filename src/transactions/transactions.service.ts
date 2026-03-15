import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/prisma.service';
import { ApiResponseBuilder } from 'src/common/utils/api-response';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { handlePrismaError } from 'src/common/utils/handle-error';
import { ApiExceptions } from 'src/common/exceptions/api.exception';
import { GetTransactionsQueryDto } from './dto/get-transactions-query.dto';

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

  async findAll(userId: number, query: GetTransactionsQueryDto) {
    try {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 5);
      const skip = (page - 1) * limit;

      const [transactions, total] = await this.prisma.$transaction([
        this.prisma.transaction.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: { category: true },
        }),
        this.prisma.transaction.count({
          where: { userId },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return ApiResponseBuilder.success('Список транзакций получен', {
        items: transactions,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasPrevPage: page > 1,
          hasNextPage: page < totalPages,
        },
      });
    } catch (error) {
      console.error(error);
      handlePrismaError(error);
    }
  }

  async findOne(id: number, userId: number) {
    try {
      const transaction = await this.prisma.transaction.findFirst({
        where: { id, userId },
        include: { category: true },
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

  async getSummary(userId: number, query: { from?: string; to?: string }) {
    try {
      const where = this.buildSummaryWhere(userId, query.from, query.to);

      const [incomeAgg, expenseAgg, grouped, categories] =
        await this.prisma.$transaction([
          this.prisma.transaction.aggregate({
            where: {
              ...where,
              type: 'INCOME',
            },
            _sum: {
              price: true,
            },
          }),
          this.prisma.transaction.aggregate({
            where: {
              ...where,
              type: 'EXPENDITURE',
            },
            _sum: {
              price: true,
            },
          }),
          this.prisma.transaction.groupBy({
            by: ['categoryId', 'type'],
            where,
            orderBy: [{ type: 'asc' }, { categoryId: 'asc' }],
            _sum: {
              price: true,
            },
          }),
          this.prisma.category.findMany({
            where: { userId },
            select: {
              id: true,
              name: true,
            },
          }),
        ]);

      const income = incomeAgg._sum.price ?? 0;
      const expense = expenseAgg._sum.price ?? 0;
      const balance = income - expense;
      const savingsPercent =
        income > 0 ? Math.round((balance / income) * 100) : 0;

      const categoryMap = new Map(
        categories.map((category) => [category.id, category.name]),
      );

      const mapCategoryItem = (item: {
        categoryId: number | null;
        _sum?: { price?: number | null } | null;
      }) => ({
        categoryId: item.categoryId,
        categoryName:
          item.categoryId === null
            ? 'Без категории'
            : (categoryMap.get(item.categoryId) ?? 'Без категории'),
        amount: item._sum?.price ?? 0,
      });

      const incomeByCategory = grouped
        .filter((item) => item.type === 'INCOME')
        .map(mapCategoryItem)
        .sort((a, b) => b.amount - a.amount);

      const expenseByCategory = grouped
        .filter((item) => item.type === 'EXPENDITURE')
        .map(mapCategoryItem)
        .sort((a, b) => b.amount - a.amount);

      return ApiResponseBuilder.success('Сводка по транзакциям получена', {
        totals: {
          income,
          expense,
          balance,
          savingsPercent,
        },
        incomeByCategory,
        expenseByCategory,
        period: {
          from: query.from ? this.startOfDay(query.from).toISOString() : null,
          to: query.to ? this.endOfDay(query.to).toISOString() : null,
        },
      });
    } catch (error) {
      console.error(error);
      handlePrismaError(error);
    }
  }

  private buildSummaryWhere(userId: number, from?: string, to?: string) {
    const where: {
      userId: number;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {
      userId,
    };

    if (from || to) {
      where.createdAt = {};

      if (from) {
        where.createdAt.gte = this.startOfDay(from);
      }

      if (to) {
        where.createdAt.lte = this.endOfDay(to);
      }
    }

    return where;
  }

  private startOfDay(date: string): Date {
    const parsed = new Date(date);
    parsed.setHours(0, 0, 0, 0);
    return parsed;
  }

  private endOfDay(date: string): Date {
    const parsed = new Date(date);
    parsed.setHours(23, 59, 59, 999);
    return parsed;
  }
}
