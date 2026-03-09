import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Body,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from './auth/dto/login.dto';
import { AuthService } from './auth/auth.service';
import { TokenResponseDto } from './auth/dto/token.dto';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import type { Response, Request as ExpressRequest } from 'express';
import { CreateUserDto } from './user/dto/create-user.dto';
import { TelegramLoginDto } from './auth/dto/telegram-login.dto';
// import { TelegramLoginDto } from './auth/dto/telegram-login.dto';

@ApiTags('Auth')
@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @Post('auth/telegram')
  @ApiOperation({
    summary: 'Telegram login/register → access_token + refresh cookie',
  })
  async telegramAuth(
    @Body() dto: TelegramLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginOrRegisterWithTelegram(dto);

    console.log('result', result);

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      access_token: result.accessToken,
      user: result.user,
    };
  }

  @Post('register')
  @ApiOperation({ summary: 'Регистрация → access_token + refresh cookie' })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({ type: TokenResponseDto })
  async register(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.registerAndLogin(dto);

    if (result.refreshToken) {
      const isProd = process.env.NODE_ENV === 'production';

      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: isProd, // false на localhost
        sameSite: isProd ? 'none' : 'lax',
        path: '/', // чтобы точно доходило
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    return { access_token: result.accessToken, user: result.user };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Логин → access_token + refresh cookie' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: TokenResponseDto })
  async login(
    @Body() _dto: LoginDto,
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenResponseDto> {
    const { accessToken, refreshToken } = await this.authService.login(
      req.user as { id: number; email: string },
    );

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd, // false на localhost
      sameSite: isProd ? 'none' : 'lax',
      path: '/', // чтобы точно доходило
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { access_token: accessToken };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Обновить access по refresh cookie (rotation)' })
  @ApiOkResponse({ type: TokenResponseDto })
  async refresh(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenResponseDto> {
    const rt = req.cookies?.refresh_token as string;

    if (!rt) throw new UnauthorizedException('No refresh cookie');

    const payload = await this.authService.verifyRefreshToken(rt); // {sub}

    const { accessToken, refreshToken: newRt } = await this.authService.refresh(
      payload.sub,
      rt,
    );

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('refresh_token', newRt, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/', // чтобы точно доходило
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { access_token: accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('logout')
  @ApiOperation({ summary: 'Logout: удалить refresh в БД и очистить cookie' })
  async logout(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = (req.user as { sub: number; email: string }).sub; // если payload {sub,email}

    await this.authService.logout(userId);

    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('refresh_token', {
      path: '/',
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    });
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('access-token')
  me(@Req() req: ExpressRequest) {
    return req.user;
  }
}
