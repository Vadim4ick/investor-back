import { ApiProperty } from '@nestjs/swagger';

export class CategorySummaryItemDto {
  @ApiProperty({ example: 1, nullable: true })
  categoryId: number | null;

  @ApiProperty({ example: 'Зарплата' })
  categoryName: string;

  @ApiProperty({ example: 110000 })
  amount: number;
}

export class TransactionsSummaryTotalsDto {
  @ApiProperty({ example: 131500 })
  income: number;

  @ApiProperty({ example: 78800 })
  expense: number;

  @ApiProperty({ example: 52700 })
  balance: number;

  @ApiProperty({ example: 40 })
  savingsPercent: number;
}

export class TransactionsSummaryDataDto {
  @ApiProperty({ type: TransactionsSummaryTotalsDto })
  totals: TransactionsSummaryTotalsDto;

  @ApiProperty({ type: [CategorySummaryItemDto] })
  incomeByCategory: CategorySummaryItemDto[];

  @ApiProperty({ type: [CategorySummaryItemDto] })
  expenseByCategory: CategorySummaryItemDto[];

  @ApiProperty({
    example: {
      from: '2026-03-01T00:00:00.000Z',
      to: '2026-03-31T23:59:59.999Z',
    },
    nullable: true,
  })
  period: {
    from: string | null;
    to: string | null;
  };
}

export class TransactionsSummaryResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Сводка по транзакциям получена' })
  message: string;

  @ApiProperty({ type: TransactionsSummaryDataDto })
  data: TransactionsSummaryDataDto;
}
