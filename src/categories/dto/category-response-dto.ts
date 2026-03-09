import { BaseApiResponseDto } from 'src/common/dto/base-api-response.dto';
import { CategoryDto } from './category.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto extends BaseApiResponseDto<CategoryDto> {
  @ApiProperty({
    type: CategoryDto,
  })
  declare data: CategoryDto;
}

export class CategoriesResponseDto extends BaseApiResponseDto<CategoryDto[]> {
  @ApiProperty({
    type: [CategoryDto],
  })
  declare data: CategoryDto[];
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Категория удалена' })
  message: string;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  data: any;
}
