import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { AuthService } from './auth/auth.service';
import { Public } from './auth/decorators';
import {
  AdminLoginDto,
  TokenDto,
  SignUpDto,
  SignUpVerificationDto,
} from './auth/dtos';

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

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

  @Post('signup/verification')
  @Public()
  @ApiOperation({
    summary: '회원가입 인증코드 전송(요청)',
    description: `feanutID로 가입 진행 가능한 경우 phoneNumber로 인증코드 발송됨.
    \nresponse된 authId와 사용자가 입력한 인증코드를 입력하여 /signup API 호출필요
  `,
  })
  async signUpVerification(
    @Body() body: SignUpVerificationDto,
  ): Promise<string> {
    return await this.authService.signUpVerification(body);
  }

  @Post('signup')
  @Public()
  @ApiOperation({
    summary: '회원가입 (완료)',
    description: `회원가입 정보는 signup/verification에서 저장한 정보로 가입처리 됩니다.
      \n가입완료시 자동로그인 accessToken발급`,
  })
  async signUp(@Body() body: SignUpDto): Promise<TokenDto> {
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
