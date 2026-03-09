/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiResponseBuilder } from 'src/common/utils/api-response';
import { handlePrismaError } from 'src/common/utils/handle-error';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const user = await this.createRaw(dto);

    return ApiResponseBuilder.created(
      this.sanitizeUser(user),
      'Пользователь успешно создан',
    );
  }

  async createRaw(dto: CreateUserDto) {
    try {
      const existing = await this.findRawByEmail(dto.email);

      if (existing) {
        throw new ConflictException({
          message: 'Пользователь с таким email уже существует',
          data: null,
        });
      }

      let hashPass: string;

      try {
        hashPass = await bcrypt.hash(dto.password, 10);
      } catch {
        throw new InternalServerErrorException({
          message: 'Ошибка хеширования пароля',
          data: null,
        });
      }

      return await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashPass,
        },
      });
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      const users = await this.prisma.user.findMany({
        orderBy: { id: 'asc' },
      });

      return ApiResponseBuilder.success(
        'Пользователи получены',
        users.map((user) => this.sanitizeUser(user)),
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findOne(id: number) {
    const user = await this.findRawByIdOrThrow(id);

    return ApiResponseBuilder.success(
      'Пользователь получен',
      this.sanitizeUser(user),
    );
  }

  async findRawById(id: number) {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findRawByIdOrThrow(id: number) {
    const user = await this.findRawById(id);

    if (!user) {
      throw new NotFoundException({
        message: 'Пользователь не найден',
        data: null,
      });
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.findRawByEmail(email);
    return user ? this.sanitizeUser(user) : null;
  }

  async findRawByEmail(email: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getByEmailOrThrow(email: string) {
    const user = await this.findRawByEmail(email);

    if (!user) {
      throw new NotFoundException({
        message: 'Пользователь не найден',
        data: null,
      });
    }

    return user;
  }

  async findByTelegramId(telegramId: string) {
    const user = await this.findRawByTelegramId(telegramId);
    return user ? this.sanitizeUser(user) : null;
  }

  async findRawByTelegramId(telegramId: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { telegramId },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async createTelegramUser(data: {
    telegramId: string;
    telegramUsername?: string | null;
    telegramFirstName: string;
    telegramLastName?: string | null;
    telegramPhotoUrl?: string | null;
  }) {
    try {
      const pass = crypto.randomBytes(32).toString('hex');

      const fullName = [data.telegramFirstName, data.telegramLastName]
        .filter(Boolean)
        .join(' ')
        .trim();

      const user = await this.prisma.user.create({
        data: {
          authProvider: 'TELEGRAM',
          username: fullName || data.telegramUsername || 'Telegram User',
          telegramId: data.telegramId,
          avatar: data.telegramPhotoUrl ?? null,
          password: pass,
        },
      });

      return this.sanitizeUser(user);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async comparePasswords(pass: string, hash: string) {
    try {
      return await bcrypt.compare(pass, hash);
    } catch {
      throw new InternalServerErrorException({
        message: 'Ошибка проверки пароля',
        data: null,
      });
    }
  }

  async updateRefreshTokenHash(userId: number, hash: string | null) {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: { refreshTokenHash: hash },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  sanitizeUser(user: User) {
    const { password, refreshTokenHash, ...result } = user;
    return result;
  }
}
