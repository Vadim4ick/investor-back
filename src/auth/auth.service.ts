/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { jwtConstants } from './constants';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

type JwtAccessPayload = { sub: number; email: string };
type JwtRefreshPayload = { sub: number }; // refresh можно без email

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email); // должен возвращать user|null
    if (!user) return null;

    const ok = await this.usersService.comparePasswords(pass, user.password);
    if (!ok) return null;

    const { password, refreshTokenHash, ...safe } = user;
    return safe; // {id,email,username...}
  }

  private async signAccessToken(user: { id: number; email: string }) {
    const payload: JwtAccessPayload = { sub: user.id, email: user.email };

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
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshTokenHash(userId, hash);
  }

  async registerAndLogin(dto: CreateUserDto) {
    const user = await this.usersService.create(dto);

    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(user),
      this.signRefreshToken({ id: user.id }),
    ]);

    await this.setRefreshTokenHash(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async login(user: { id: number; email: string }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(user),
      this.signRefreshToken({ id: user.id }),
    ]);

    await this.setRefreshTokenHash(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async refresh(userId: number, refreshTokenFromCookie: string) {
    const user = await this.usersService.findOne(userId);
    if (!user?.refreshTokenHash)
      throw new ForbiddenException('No refresh token');

    const match = await bcrypt.compare(
      refreshTokenFromCookie,
      user.refreshTokenHash,
    );
    if (!match) throw new ForbiddenException('Refresh token mismatch');

    // rotation
    const [accessToken, newRefreshToken] = await Promise.all([
      this.signAccessToken({ id: user.id, email: user.email }),
      this.signRefreshToken({ id: user.id }),
    ]);

    await this.setRefreshTokenHash(user.id, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: number) {
    await this.usersService.updateRefreshTokenHash(userId, null);
    return { ok: true };
  }

  async verifyRefreshToken(token: string): Promise<{ sub: number }> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
