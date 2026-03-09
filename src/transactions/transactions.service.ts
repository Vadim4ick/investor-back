import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  create(createTransactionDto: CreateTransactionDto, userId: number) {
    return this.prisma.transaction.create({
      data: {
        ...createTransactionDto,
        userId,
      },
    });
  }

  findAll(userId: number) {
    return this.prisma.transaction.findMany({ where: { userId } });
  }

  findOne(id: number, userId: number) {
    return this.prisma.transaction.findUnique({ where: { id, userId } });
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return this.prisma.transaction.update({
      where: { id },
      data: updateTransactionDto,
    });
  }

  remove(id: number) {
    return this.prisma.transaction.delete({ where: { id } });
  }
}
