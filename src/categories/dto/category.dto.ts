import { ApiProperty } from '@nestjs/swagger';

export class CategoryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Еда' })
  name: string;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: '2026-03-09T01:00:00.000Z' })
  createdAt: Date;
}
