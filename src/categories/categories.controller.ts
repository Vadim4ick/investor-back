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
import {
  CategoriesResponseDto,
  CategoryResponseDto,
  MessageResponseDto,
} from './dto/category-response-dto';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

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
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
    type: ErrorResponseDto,
  })
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser() user: { sub: number; email?: string },
  ) {
    return this.categoriesService.create(createCategoryDto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список категорий' })
  @ApiResponse({
    status: 200,
    description: 'Список категорий успешно получен',
    type: CategoriesResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
    type: ErrorResponseDto,
  })
  findAll(@CurrentUser() user: { sub: number; email?: string }) {
    return this.categoriesService.findAll(user.sub);
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
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Категория не найдена',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
    type: ErrorResponseDto,
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
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Категория не найдена',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
    type: ErrorResponseDto,
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
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Категория не найдена',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
    type: ErrorResponseDto,
  })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
