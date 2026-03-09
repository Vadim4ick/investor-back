import { ApiProperty } from '@nestjs/swagger';

class AuthUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'test@example.com', nullable: true })
  email?: string | null;

  @ApiProperty({ example: 'Vadim', nullable: true })
  username?: string | null;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', nullable: true })
  avatar?: string | null;

  @ApiProperty({ example: 'LOCAL' })
  authProvider: string;

  @ApiProperty({ example: '123456789', nullable: true })
  telegramId?: string | null;

  @ApiProperty({ example: '2026-03-09T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-03-09T00:00:00.000Z' })
  updatedAt: Date;
}

class AuthDataDto {
  @ApiProperty({ example: 'jwt-access-token' })
  accessToken: string;

  @ApiProperty({
    type: () => AuthUserDto,
    nullable: true,
  })
  user: AuthUserDto | null;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'Авторизация выполнена успешно' })
  message: string;

  @ApiProperty({ type: () => AuthDataDto })
  data: AuthDataDto;
}

export class LogoutResponseDto {
  @ApiProperty({ example: 'Выход выполнен успешно' })
  message: string;

  @ApiProperty({ example: null, nullable: true, type: Object })
  data: null;
}

export class MeResponseDto {
  @ApiProperty({ example: 'Текущий пользователь получен' })
  message: string;

  @ApiProperty({
    example: {
      sub: 1,
      email: 'test@example.com',
    },
    type: Object,
  })
  data: {
    sub: number;
    email?: string;
  };
}
