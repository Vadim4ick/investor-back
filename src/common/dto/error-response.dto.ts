import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 'Категория не найдена' })
  message: string;

  @ApiProperty({
    example: null,
    nullable: true,
    type: Object,
  })
  data: null;
}
