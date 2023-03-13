import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  AUTH_ERROR_SIGNIN_COOL_TIME,
  AUTH_MODULE_NAME,
} from './auth/auth.constant';
import { AuthService } from './auth/auth.service';
import { Public } from './auth/decorators';
import {
  AuthDto,
  EmailLoginDto,
  KakaoLoginDto,
  LoginDto,
  TokenDto,
} from './auth/dtos';
import { WrappedError } from './common/errors';

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin/kakao')
  @Public()
  @ApiOperation({ summary: '카카오 로그인' })
  async signInKakao(@Body() body: KakaoLoginDto): Promise<TokenDto> {
    return await this.authService.kakaoLogin(body.accessToken);
  }

  @Post('signin/email')
  @Public()
  @ApiOperation({ summary: '이메일 로그인' })
  async signInEmail(@Body() body: EmailLoginDto): Promise<AuthDto> {
    const enableLogin = await this.authService.checkEmailLoginCoolTime(
      body.email,
    );
    if (!enableLogin) {
      throw new WrappedError(
        AUTH_MODULE_NAME,
        AUTH_ERROR_SIGNIN_COOL_TIME,
      ).reject();
    }

    const authId = await this.authService.emailLogin(body.email);

    return {
      authId,
    };
  }

  @Post('signin')
  @Public()
  @ApiOperation({ summary: '로그인' })
  async signIn(@Body() body: LoginDto): Promise<TokenDto> {
    return await this.authService.login(body);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Health Check' })
  getHello(): string {
    return 'Feanut API';
  }
}
