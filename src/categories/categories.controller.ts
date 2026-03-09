import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Categories')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Создать категорию' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Категория успешно создана',
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные',
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список категорий' })
  @ApiResponse({
    status: 200,
    description: 'Список категорий успешно получен',
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
  })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить категорию по ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID категории',
  })
  @ApiResponse({
    status: 200,
    description: 'Категория успешно найдена',
  })
  @ApiResponse({
    status: 404,
    description: 'Категория не найдена',
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
  })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить категорию' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID категории',
  })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Категория успешно обновлена',
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные',
  })
  @ApiResponse({
    status: 404,
    description: 'Категория не найдена',
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
  })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить категорию' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID категории',
  })
  @ApiResponse({
    status: 200,
    description: 'Категория успешно удалена',
  })
  @ApiResponse({
    status: 404,
    description: 'Категория не найдена',
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
  })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
