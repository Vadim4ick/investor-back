import { BaseApiResponseDto } from 'src/common/dto/base-api-response.dto';

import { ApiProperty } from '@nestjs/swagger';
import { TransactionDto } from './transaction.dto';

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
