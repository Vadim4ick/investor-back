import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Бады' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  userId: number;
}
