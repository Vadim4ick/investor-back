import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class GetTransactionsSummaryQueryDto {
  @ApiPropertyOptional({
    example: '2026-03-01',
    description: 'Начало периода в формате ISO date',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-03-31',
    description: 'Конец периода в формате ISO date',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
