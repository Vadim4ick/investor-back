/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('User already exists'); // 409
    }

    let hashPass: string;
    try {
      hashPass = await bcrypt.hash(dto.password, 10);
    } catch {
      throw new InternalServerErrorException('Error hashing password'); // 500
    }

    const user = await this.prisma.user.create({
      data: { email: dto.email, password: hashPass },
    });

    // лучше возвращать DTO/mapper-ом, но ок:
    const { password, ...result } = user;
    return result;
  }

  async findByTelegramId(telegramId: string) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) return null;

    const { password, ...result } = user;

    return result;
  }

  async createTelegramUser(data: {
    telegramId: string;
    telegramUsername?: string | null;
    telegramFirstName: string;
    telegramLastName?: string | null;
    telegramPhotoUrl?: string | null;
  }) {
    const pass = crypto.randomBytes(32).toString('hex');

    const user = await this.prisma.user.create({
      data: {
        authProvider: 'TELEGRAM',
        username: `${data.telegramFirstName} ${data.telegramLastName}`,
        telegramId: data.telegramId,
        password: pass,
      },
    });

    // const { password, ...result } = user;

    return user;
  }

  async comparePasswords(pass: string, hash: string) {
    return await bcrypt.compare(pass, hash);
  }

  async updateRefreshTokenHash(userId: number, hash: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found'); // 404

    const { password, ...result } = user;
    return result;
  }

  // ВАЖНО: для проверок существования — не бросаем исключение
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } }); // user | null
  }

  // Если где-то реально нужно 404 по email:
  async getByEmailOrThrow(email: string) {
    const user = await this.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
