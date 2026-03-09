import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { UserService } from 'src/user/user.service';
import { jwtConstants } from './constants';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { TelegramLoginDto } from './dto/telegram-login.dto';
import { ApiResponseBuilder } from 'src/common/utils/api-response';

type JwtAccessPayload = { sub: number; email?: string };
type JwtRefreshPayload = { sub: number };

export function verifyTelegramAuth(
  dto: TelegramLoginDto,
  botToken: string,
): void {
  const { hash, ...data } = dto;

  const dataCheckString = Object.entries(data)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(botToken).digest();

  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (computedHash !== hash) {
    throw new UnauthorizedException({
      message: 'Невалидный Telegram hash',
      data: null,
    });
  }

  const now = Math.floor(Date.now() / 1000);
  const maxAgeSeconds = 60 * 10;

  if (now - dto.auth_date > maxAgeSeconds) {
    throw new UnauthorizedException({
      message: 'Данные Telegram устарели',
      data: null,
    });
  }
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findRawByEmail(email);
    if (!user) return null;

    const ok = await this.usersService.comparePasswords(pass, user.password);
    if (!ok) return null;

    return this.usersService.sanitizeUser(user);
  }

  private async signAccessToken(user: { id: number; email?: string | null }) {
    const payload: JwtAccessPayload = {
      sub: user.id,
      ...(user.email ? { email: user.email } : {}),
    };

    return this.jwtService.signAsync(payload, {
      secret: jwtConstants.secret_access,
      expiresIn: '15m',
    });
  }

  private async signRefreshToken(user: { id: number }) {
    const payload: JwtRefreshPayload = { sub: user.id };

    return this.jwtService.signAsync(payload, {
      secret: jwtConstants.secret_refresh,
      expiresIn: '7d',
    });
  }

  private async setRefreshTokenHash(userId: number, refreshToken: string) {
    try {
      const hash = await bcrypt.hash(refreshToken, 10);
      await this.usersService.updateRefreshTokenHash(userId, hash);
    } catch {
      throw new InternalServerErrorException({
        message: 'Не удалось сохранить refresh token',
        data: null,
      });
    }
  }

  async registerAndLogin(dto: CreateUserDto) {
    const user = await this.usersService.createRaw(dto);
    const safeUser = this.usersService.sanitizeUser(user);

    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(safeUser),
      this.signRefreshToken({ id: user.id }),
    ]);

    await this.setRefreshTokenHash(user.id, refreshToken);

    return ApiResponseBuilder.success('Регистрация выполнена успешно', {
      accessToken,
      refreshToken,
      user: safeUser,
    });
  }

  async login(user: { id: number; email?: string | null }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(user),
      this.signRefreshToken({ id: user.id }),
    ]);

    await this.setRefreshTokenHash(user.id, refreshToken);

    return ApiResponseBuilder.success('Авторизация выполнена успешно', {
      accessToken,
      refreshToken,
    });
  }

  async loginOrRegisterWithTelegram(dto: TelegramLoginDto) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      throw new InternalServerErrorException({
        message: 'TELEGRAM_BOT_TOKEN не задан',
        data: null,
      });
    }

    verifyTelegramAuth(dto, botToken);

    let user = await this.usersService.findByTelegramId(String(dto.id));

    if (!user) {
      user = await this.usersService.createTelegramUser({
        telegramId: String(dto.id),
        telegramUsername: dto.username ?? null,
        telegramFirstName: dto.first_name,
        telegramLastName: dto.last_name ?? null,
        telegramPhotoUrl: dto.photo_url ?? null,
      });
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken({ id: user.id, email: user.email ?? undefined }),
      this.signRefreshToken({ id: user.id }),
    ]);

    await this.setRefreshTokenHash(user.id, refreshToken);

    return ApiResponseBuilder.success('Вход через Telegram выполнен успешно', {
      accessToken,
      refreshToken,
      user,
    });
  }

  async refresh(userId: number, refreshTokenFromCookie: string) {
    const user = await this.usersService.findRawByIdOrThrow(userId);

    if (!user.refreshTokenHash) {
      throw new ForbiddenException({
        message: 'Refresh token отсутствует',
        data: null,
      });
    }

    const match = await bcrypt.compare(
      refreshTokenFromCookie,
      user.refreshTokenHash,
    );

    if (!match) {
      throw new ForbiddenException({
        message: 'Refresh token не совпадает',
        data: null,
      });
    }

    const [accessToken, newRefreshToken] = await Promise.all([
      this.signAccessToken({ id: user.id, email: user.email ?? undefined }),
      this.signRefreshToken({ id: user.id }),
    ]);

    await this.setRefreshTokenHash(user.id, newRefreshToken);

    return ApiResponseBuilder.success('Токены успешно обновлены', {
      accessToken,
      refreshToken: newRefreshToken,
    });
  }

  async logout(userId: number) {
    await this.usersService.updateRefreshTokenHash(userId, null);

    return ApiResponseBuilder.success('Выход выполнен успешно', null);
  }

  async verifyRefreshToken(token: string): Promise<{ sub: number }> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret_refresh,
      });
    } catch {
      throw new UnauthorizedException({
        message: 'Невалидный refresh token',
        data: null,
      });
    }
  }
}
