import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import {
  AUTH_ERROR_NOT_FOUND_USERNAME,
  INSTAGRAM_AUTH_REDIRECT_PATH,
} from './auth/auth.constant';
import { AuthService } from './auth/auth.service';
import { Public } from './auth/decorators';
import {
  AdminLoginDto,
  TokenDto,
  SignUpDto,
  SignUpVerificationDto,
  LoginDto,
  ResetPasswordDto,
  ResetPasswordVerificationDto,
  ResetPasswordVerificationCodeDto,
  RefreshTokenDto,
} from './auth/dtos';

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @Get(INSTAGRAM_AUTH_REDIRECT_PATH)
  @Public()
  @ApiOperation({
    summary: '인스타그램 redirect api',
    description: `요청 완료시 다이나믹 링크 redirect 됩니다.`,
  })
  async oauthInstagram(
    @Query('state') state: string,
    @Query('code') code: string,
  ) {
    await this.authService.authInstagram(code, state);
    return `<h1>succeed</h1>`;
  }

  @Post('token')
  @Public()
  @ApiOperation({
    summary: 'Token 재발급',
  })
  @ApiOkResponse({ type: TokenDto })
  async token(@Body() body: RefreshTokenDto) {
    return await this.authService.validateRefreshToken(body.refreshToken);
  }

  @Post('signin/admin')
  @Public()
  @ApiOperation({
    summary: '관리자 로그인',
  })
  @ApiBody({
    type: AdminLoginDto,
  })
  @ApiOkResponse({
    type: TokenDto,
  })
  async adminLogin(@Body() body: AdminLoginDto) {
    return this.authService.adminLogin(body);
  }

  @Post('signin')
  @Public()
  @ApiOperation({
    summary: 'feanutID로 로그인',
    description: `존재하지 않는 ID는 status: 404(Not Found), code: ${AUTH_ERROR_NOT_FOUND_USERNAME} 응답`,
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: TokenDto })
  async signin(@Body() body: LoginDto) {
    const sub = await this.authService.validate(body.username, body.password);
    return await this.authService.userLogin(sub);
  }

  @Post('signup/verification')
  @Public()
  @ApiOperation({
    summary: '회원가입 인증코드 전송(요청)',
    description: `feanutID로 가입 진행 가능한 경우 phoneNumber로 인증코드 발송됨.
    \nresponse된 authId와 사용자가 입력한 인증코드를 입력하여 /signup API 호출필요
  `,
  })
  @ApiOkResponse({ type: String, description: 'authId' })
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

  @Post('resetpassword/verification/code')
  @Public()
  @ApiOperation({
    summary: '비밀번호 재설정 인증코드 검증',
  })
  @ApiOkResponse({ type: String, description: 'authId' })
  async resetPasswordVerificationCode(
    @Body() body: ResetPasswordVerificationCodeDto,
  ) {
    return await this.authService.resetPasswordVerificationCode(body);
  }

  @Post('resetpassword/verification')
  @Public()
  @ApiOperation({
    summary: '비밀번호 재설정 인증코드 전송(요청)',
  })
  @ApiOkResponse({ type: String, description: 'authId' })
  async resetPasswordVerification(@Body() body: ResetPasswordVerificationDto) {
    return await this.authService.resetPasswordVerification(body);
  }

  @Post('resetpassword')
  @Public()
  @ApiOperation({
    summary: '비밀번호 재설정 (완료)',
    description: `인증코드 전송(요청)에서 입력했던 feanutId의 비밀번호가 변경됩니다.`,
  })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return await this.authService.resetPassword(body);
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
