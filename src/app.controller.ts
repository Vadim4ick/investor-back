import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest, Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';

import { AuthService } from './auth/auth.service';
import { TelegramLoginDto } from './auth/dto/telegram-login.dto';
import {
  AuthResponseDto,
  LogoutResponseDto,
  MeResponseDto,
} from './auth/dto/auth.dto';
import { LoginDto } from './auth/dto/login.dto';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setRefreshCookie(res: Response, refreshToken: string) {
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearRefreshCookie(res: Response) {
    const isProd = process.env.NODE_ENV === 'production';

    res.clearCookie('refresh_token', {
      path: '/',
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    });
  }

  @Post('telegram')
  @ApiOperation({
    summary: 'Вход или регистрация через Telegram',
  })
  @ApiBody({ type: TelegramLoginDto })
  @ApiOkResponse({
    description: 'Успешный вход через Telegram',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Невалидные данные Telegram',
    type: ErrorResponseDto,
  })
  async telegramAuth(
    @Body() dto: TelegramLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginOrRegisterWithTelegram(dto);

    if (!result.data) {
      return result;
    }

    this.setRefreshCookie(res, result.data.refreshToken);

    return {
      message: result.message,
      data: {
        accessToken: result.data.accessToken,
        user: result.data.user,
      },
    };
  }

  @Post('register')
  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({
    description: 'Пользователь успешно зарегистрирован',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Пользователь уже существует',
    type: ErrorResponseDto,
  })
  async register(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.registerAndLogin(dto);

    if (!result.data) {
      return result;
    }

    this.setRefreshCookie(res, result.data.refreshToken);

    return {
      message: result.message,
      data: {
        accessToken: result.data.accessToken,
        user: result.data.user,
      },
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Логин пользователя' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Успешная авторизация',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Неверный email или пароль',
    type: ErrorResponseDto,
  })
  async login(
    @Body() _dto: LoginDto,
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(
      req.user as { id: number; email?: string | null },
    );

    if (!result.data) {
      return result;
    }

    this.setRefreshCookie(res, result.data.refreshToken);

    return {
      message: result.message,
      data: {
        accessToken: result.data.accessToken,
        user: null,
      },
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Обновить access token по refresh cookie' })
  @ApiOkResponse({
    description: 'Токены успешно обновлены',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh cookie отсутствует или невалиден',
    type: ErrorResponseDto,
  })
  async refresh(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rt = req.cookies?.refresh_token as string | undefined;

    if (!rt) {
      throw new UnauthorizedException({
        message: 'Refresh cookie отсутствует',
        data: null,
      });
    }

    const payload = await this.authService.verifyRefreshToken(rt);

    const result = await this.authService.refresh(payload.sub, rt);

    if (!result.data) {
      return result;
    }

    this.setRefreshCookie(res, result.data.refreshToken);

    return {
      message: result.message,
      data: {
        accessToken: result.data.accessToken,
        user: null,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('logout')
  @ApiOperation({ summary: 'Выход пользователя' })
  @ApiOkResponse({
    description: 'Пользователь успешно вышел',
    type: LogoutResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
    type: ErrorResponseDto,
  })
  async logout(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = (req.user as { sub: number; email?: string }).sub;

    const result = await this.authService.logout(userId);

    this.clearRefreshCookie(res);

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('me')
  @ApiOperation({ summary: 'Получить текущего пользователя' })
  @ApiOkResponse({
    description: 'Текущий пользователь получен',
    type: MeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
    type: ErrorResponseDto,
  })
  me(@Req() req: ExpressRequest) {
    return {
      message: 'Текущий пользователь получен',
      data: req.user,
    };
  }
}
