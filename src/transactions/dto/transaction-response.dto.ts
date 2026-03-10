import { BaseApiResponseDto } from 'src/common/dto/base-api-response.dto';

import { ApiProperty } from '@nestjs/swagger';
import { TransactionDto } from './transaction.dto';
import { PaginationMetaDto } from 'src/common/dto/pagination-meta.dto';

export class TransactionResponseDto extends BaseApiResponseDto<TransactionDto> {
  @ApiProperty({
    type: TransactionDto,
  })
  declare data: TransactionDto;
}

export class TransactionsResponseDto extends BaseApiResponseDto<
  TransactionDto[]
> {
  @ApiProperty({
    type: [TransactionDto],
  })
  declare data: TransactionDto[];

  @ApiProperty({ type: PaginationMetaDto })
  declare meta: PaginationMetaDto;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Транзакция удалена' })
  message: string;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  data: any;
}
