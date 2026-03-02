import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список пользователей',
    description:
      'Возвращает список пользователей без чувствительных полей (например, password).',
  })
  @ApiOkResponse({
    description: 'Список пользователей',
    type: UserDto,
    isArray: true,
  })
  async findAll(): Promise<UserDto[]> {
    return await this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить пользователя',
    description:
      'Возвращает пользователя без чувствительных полей (например, password).',
  })
  @ApiOkResponse({
    description: 'Пользователь',
    type: UserDto,
  })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
