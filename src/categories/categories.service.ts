import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma.service';
import { ApiResponseBuilder } from 'src/common/utils/api-response';
import { handlePrismaError } from 'src/common/utils/handle-error';
import { ApiExceptions } from 'src/common/exceptions/api.exception';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto, userId: number) {
    try {
      const category = await this.prisma.category.create({
        data: {
          ...createCategoryDto,
          userId,
        },
      });

      if (!category) {
        ApiExceptions.notFound('Категория не создана');
      }

      return ApiResponseBuilder.created(category);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll(userId: number) {
    try {
      const categories = await this.prisma.category.findMany({
        where: {
          OR: [{ userId }, { userId: null }],
        },
        orderBy: { id: 'asc' },
      });

      return ApiResponseBuilder.success('Категории получены', categories);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findOne(id: number) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        ApiExceptions.notFound('Категория не найдена');
      }

      return ApiResponseBuilder.success('Категория получена', category);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handlePrismaError(error);
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    try {
      const existingCategory = await this.prisma.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        ApiExceptions.notFound(`Категория с id ${id} не найдена`);
      }

      const category = await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
      });

      return ApiResponseBuilder.updated(category);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handlePrismaError(error);
    }
  }

  async remove(id: number) {
    try {
      const existingCategory = await this.prisma.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        ApiExceptions.notFound(`Категория с id ${id} не найдена`);
      }

      await this.prisma.category.delete({
        where: { id },
      });

      return ApiResponseBuilder.deleted();
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handlePrismaError(error);
    }
  }
}
