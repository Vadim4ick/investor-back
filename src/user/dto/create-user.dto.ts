import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'vadim@example.com',
    description: 'Email пользователя',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'Пароль пользователя (минимум 6 символов)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
