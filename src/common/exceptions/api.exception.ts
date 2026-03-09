import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export class ApiExceptions {
  static notFound(message: string) {
    throw new NotFoundException({
      message,
      data: null,
    });
  }

  static badRequest(message: string) {
    throw new BadRequestException({
      message,
      data: null,
    });
  }

  static unauthorized(message = 'Не авторизован') {
    throw new UnauthorizedException({
      message,
      data: null,
    });
  }
}
