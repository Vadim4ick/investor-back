import { BaseApiResponseDto } from 'src/common/dto/base-api-response.dto';

import { ApiProperty } from '@nestjs/swagger';
import { TransactionDto } from './transaction.dto';
import { PaginationMetaDto } from 'src/common/dto/pagination-meta.dto';

export class TransactionResponseDto extends BaseApiResponseDto<TransactionDto> {
  @ApiProperty({
    type: TransactionDto,
  })
  declare items: TransactionDto;
}

class TransactionsPaginatedDataDto {
  @ApiProperty({ type: [TransactionDto] })
  items: TransactionDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class TransactionsResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty({ type: TransactionsPaginatedDataDto })
  data: TransactionsPaginatedDataDto;
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
