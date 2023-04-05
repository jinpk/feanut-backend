import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { INSTAGRAM_AUTH_REDIRECT_PATH } from './auth/auth.constant';
import { AuthService } from './auth/auth.service';
import { Public } from './auth/decorators';
import {
  TokenDto,
  SignUpDto,
  SignUpVerificationDto,
  RefreshTokenDto,
  AuthDto,
  SignInDto,
  SignInVerificationDto,
} from './auth/dtos';

@Controller()
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /** 인스타그램 */
  @Get(`${INSTAGRAM_AUTH_REDIRECT_PATH}/success`)
  @Public()
  @ApiOperation({
    summary: '인스타그램 계정연동 성공 Redirected',
    description: `인스타그램 계정연동 완료시 해당 경로로 redirect 됩니다.`,
  })
  async oauthInstagramSucceess() {
    return `You have successfully linked your Instagram account to feanut.`;
  }

  @Get(INSTAGRAM_AUTH_REDIRECT_PATH)
  @Public()
  @ApiOperation({
    summary: '인스타그램 계정연동 for instagram',
    description: `연동 완료시 redirect 됩니다.`,
  })
  async oauthInstagram(
    @Query('state') state: string,
    @Query('code') code: string,
    @Res() res,
  ) {
    await this.authService.authInstagram(code, state);
    res.redirect(
      `${this.configService.get(
        'host',
      )}${INSTAGRAM_AUTH_REDIRECT_PATH}/success`,
    );
  }

  /** 토큰 */
  @Post('token')
  @Public()
  @ApiOperation({
    summary: 'Token 재발급',
  })
  @ApiOkResponse({ type: TokenDto })
  async token(@Body() body: RefreshTokenDto) {
    return await this.authService.validateRefreshToken(body.refreshToken);
  }

  /** 로그인 */
  @Post('signin/verification')
  @Public()
  @ApiOperation({
    summary: '로그인 인증코드 전송 요청',
  })
  @ApiOkResponse({ type: AuthDto })
  async signInVerification(@Body() body: SignInVerificationDto) {
    return await this.authService.signInVerification(body);
  }

  @Post('signin')
  @Public()
  @ApiOperation({
    summary: '로그인',
  })
  @ApiCreatedResponse({ type: TokenDto })
  async signIn(@Body() body: SignInDto) {
    return await this.authService.signIn(body);
  }

  /** 회원가입 */
  @Post('signup/verification')
  @Public()
  @ApiOperation({
    summary: '회원가입 인증코드 전송(요청)',
    description: `phoneNumber로 인증코드 발송됨.
    \nresponse된 authId와 사용자가 입력한 인증코드를 입력하여 /signup API 호출필요
  `,
  })
  @ApiOkResponse({ type: AuthDto })
  async signUpVerification(@Body() body: SignUpVerificationDto) {
    return await this.authService.signUpVerification(body);
  }

  @Post('signup')
  @Public()
  @ApiOperation({
    summary: '회원가입 (완료)',
    description: `회원가입 정보는 signup/verification에서 저장한 정보로 가입처리 됩니다.
      \n가입완료시 자동로그인 accessToken발급`,
  })
  @ApiCreatedResponse({ type: TokenDto })
  async signUp(@Body() body: SignUpDto) {
    return await this.authService.signUp(body);
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
