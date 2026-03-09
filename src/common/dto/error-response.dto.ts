import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    example: 'Ошибка запроса',
    description: 'Описание ошибки',
  })
  message: string;

  @ApiProperty({
    example: null,
    nullable: true,
    type: Object,
  })
  data: null;
}
