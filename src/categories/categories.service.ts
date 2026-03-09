import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma.service';
import { ApiResponseBuilder } from 'src/common/utils/api-response';
import { handlePrismaError } from 'src/common/utils/handle-error';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = await this.prisma.category.create({
        data: createCategoryDto,
      });

      return ApiResponseBuilder.created(category);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      const categories = await this.prisma.category.findMany({
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
        throw new NotFoundException({
          message: `Категория с id ${id} не найдена`,
          data: null,
        });
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
        throw new NotFoundException({
          message: `Категория с id ${id} не найдена`,
          data: null,
        });
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
        throw new NotFoundException({
          message: `Категория с id ${id} не найдена`,
          data: null,
        });
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
