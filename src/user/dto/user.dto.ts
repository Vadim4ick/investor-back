// dto/user.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'vadim@example.com' })
  email?: string | null;

  @ApiProperty({ example: 'Vadim', required: false, nullable: true })
  username?: string | null;
}
