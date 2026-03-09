import { ApiProperty } from '@nestjs/swagger';

export class BaseApiResponseDto<T = unknown> {
  @ApiProperty({ example: 'Успешно' })
  message: string;

  data: T;
}
