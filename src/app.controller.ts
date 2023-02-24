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
  LoginDto,
  PhoneNumberLoginDto,
  TokenDto,
} from './auth/dtos';

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin/email')
  @Public()
  @ApiOperation({ summary: '이메일 로그인' })
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

  @Post('signin/phonenumber')
  @Public()
  @ApiOperation({ summary: '휴대폰번호 로그인' })
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

  @Post('signin')
  @Public()
  @ApiOperation({ summary: '로그인' })
  async signIn(@Body() body: LoginDto): Promise<TokenDto> {
    return await this.authService.login(body);
  }

  @Get()
  @Public()
  getHello(): string {
    return 'Feanut API';
  }
}
