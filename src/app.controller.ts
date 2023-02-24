import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotAcceptableException,
  Post,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  AUTH_ERROR_SIGNIN_COOL_TIME,
  AUTH_MODULE_NAME,
} from './auth/auth.constant';
import { AuthService } from './auth/auth.service';
import {
  AuthDto,
  EmailLoginDto,
  LoginDto,
  PhoneNumberLoginDto,
  TokenDto,
} from './auth/dtos';

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '이메일 로그인' })
  @Post('signin/email')
  async signInEmail(@Body() body: EmailLoginDto): Promise<AuthDto> {
    const enableLogin = await this.authService.checkEmailLoginCoolTime(
      body.email,
    );
    if (!enableLogin) {
      throw new ForbiddenException({
        domain: AUTH_MODULE_NAME,
        code: AUTH_ERROR_SIGNIN_COOL_TIME,
      });
    }

    const authId = await this.authService.emailLogin(body.email);

    return {
      authId,
    };
  }

  @ApiOperation({ summary: '휴대폰번호 로그인' })
  @Post('signin/phonenumber')
  async signInPhone(@Body() body: PhoneNumberLoginDto): Promise<AuthDto> {
    const enableLogin = await this.authService.checkPhoneLoginCoolTime(
      body.phoneNumber,
    );
    if (!enableLogin) {
      throw new ForbiddenException({
        domain: AUTH_MODULE_NAME,
        code: AUTH_ERROR_SIGNIN_COOL_TIME,
      });
    }

    const authId = await this.authService.phoneNumberLogin(body.phoneNumber);

    return {
      authId,
    };
  }

  @ApiOperation({ summary: '로그인' })
  @Post('signin')
  async signIn(@Body() body: LoginDto): Promise<TokenDto> {
    return await this.authService.login(body);
  }

  @Get()
  getHello(): string {
    return 'Feanut API';
  }
}
