import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { PriceVariant } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({ example: 50 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 'Кофе в кофейне', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: PriceVariant, example: PriceVariant.EXPENDITURE })
  @IsEnum(PriceVariant)
  type: PriceVariant;

  @ApiProperty({ example: 3, description: 'ID категории' })
  @IsNumber()
  categoryId: number;

  @ApiProperty({ example: 15, description: 'ID категории' })
  userId: number;
}
