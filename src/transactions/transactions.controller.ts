import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';

import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { TransactionDto } from './dto/transaction.dto';
import {
  MessageResponseDto,
  TransactionResponseDto,
  TransactionsResponseDto,
} from './dto/transaction-response.dto';
import { GetTransactionsQueryDto } from './dto/get-transactions-query.dto';

@ApiTags('Transactions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать транзакцию' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({
    status: 201,
    description: 'Транзакция успешно создана',
    type: TransactionResponseDto,
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
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser() user: { sub: number; email?: string },
  ) {
    return this.transactionsService.create(createTransactionDto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все транзакции пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Список транзакций получен',
    type: TransactionsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
    type: ErrorResponseDto,
  })
  findAll(
    @CurrentUser() user: { sub: number; email?: string },
    @Query() query: GetTransactionsQueryDto,
  ) {
    return this.transactionsService.findAll(user.sub, query);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Получить транзакцию по ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID транзакции',
  })
  @ApiResponse({
    status: 200,
    description: 'Транзакция найдена',
    type: TransactionDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Транзакция не найдена',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
    type: ErrorResponseDto,
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { sub: number; email?: string },
  ) {
    return this.transactionsService.findOne(id, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить транзакцию' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID транзакции',
  })
  @ApiBody({ type: UpdateTransactionDto })
  @ApiResponse({
    status: 200,
    description: 'Транзакция обновлена',
    type: TransactionDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Транзакция не найдена',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
    type: ErrorResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @CurrentUser() user: { sub: number; email?: string },
  ) {
    return this.transactionsService.update(id, updateTransactionDto, user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить транзакцию' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID транзакции',
  })
  @ApiResponse({
    status: 200,
    description: 'Транзакция удалена',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Транзакция не найдена',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
    type: ErrorResponseDto,
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { sub: number; email?: string },
  ) {
    return this.transactionsService.remove(id, user.sub);
  }
}
