import { ApiProperty } from '@nestjs/swagger';
import { PriceVariant } from '@prisma/client';

export class TransactionDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 50 })
  price: number;

  @ApiProperty({ example: 'Кофе в кофейне', nullable: true })
  description?: string | null;

  @ApiProperty({ enum: PriceVariant })
  type: PriceVariant;

  @ApiProperty({ example: 2 })
  categoryId: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
