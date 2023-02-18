import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { LoginDto, TokenDto } from './auth/dtos';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  @Post('signin')
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: '로그인' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: TokenDto })
  async signin(@Req() req): Promise<TokenDto> {
    return {
      accessToken: this.authService.genToken({ sub: req.user }),
      refreshToken: '',
    };
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
