import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma.service';
import { ApiResponseBuilder } from 'src/common/utils/api-response';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.prisma.category.create({
      data: createCategoryDto,
    });

    return ApiResponseBuilder.created(category);
  }

  async findAll() {
    const categories = await this.prisma.category.findMany();

    return ApiResponseBuilder.success('Категории получены', categories);
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    return ApiResponseBuilder.success('Категория получена', category);
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });

    return ApiResponseBuilder.updated(category);
  }

  async remove(id: number) {
    await this.prisma.category.delete({
      where: { id },
    });

    return ApiResponseBuilder.deleted('Категория удалена');
  }
}
