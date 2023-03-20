import {
  Body,
  Controller,
  ForbiddenException,
  UseGuards,
  UnauthorizedException,
  Request,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiBody, ApiOkResponse } from '@nestjs/swagger';
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
import { AdminLoginDto } from './admin/dtos/admin.dto';
import { WrappedError } from './common/errors';
// import { LocalAuthAdminGuard } from '../src/auth/guards/local.guard';

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

  // @Post('admin/signin')
  // @Public()
  // @UseGuards(LocalAuthAdminGuard)
  // @ApiOperation({
  //   summary: '관리자 로그인',
  // })
  // @ApiBody({
  //   type: AdminLoginDto,
  // })
  // @ApiOkResponse({
  //   type: TokenDto,
  // })
  // async adminLogin(@Request() req) {
  //   return this.authService.adminLogin(req.user);
  // }

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

  @Get('link')
  @Public()
  @ApiOperation({ summary: 'Firebase Dynamic Link Proxy' })
  link(@Query('action') action, @Query('payload') payload) {
    return 'Success';
  }
}
