import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

interface AuthRequest extends Request {
  user: {
    sub: number;
    email?: string;
  };
}

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
  })
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Req() req: AuthRequest,
  ) {
    return this.transactionsService.create(createTransactionDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все транзакции пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Список транзакций',
  })
  findAll(@Req() req: AuthRequest) {
    return this.transactionsService.findAll(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить транзакцию по ID' })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID транзакции',
  })
  @ApiResponse({
    status: 200,
    description: 'Транзакция найдена',
  })
  @ApiResponse({
    status: 404,
    description: 'Транзакция не найдена',
  })
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.transactionsService.findOne(+id, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить транзакцию' })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  @ApiBody({ type: UpdateTransactionDto })
  @ApiResponse({
    status: 200,
    description: 'Транзакция обновлена',
  })
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(+id, updateTransactionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить транзакцию' })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Транзакция удалена',
  })
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(+id);
  }
}
