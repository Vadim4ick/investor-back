import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class TelegramLoginDto {
  @Type(() => Number)
  @IsInt()
  id!: number;

  @IsString()
  first_name!: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  photo_url?: string;

  @Type(() => Number)
  @IsInt()
  auth_date!: number;

  @IsString()
  hash!: string;
}
