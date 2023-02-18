import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<string> {
    const sub = await this.authService.validateUser(username, password);
    if (!sub) {
      throw new UnauthorizedException('가입되지 않은 사용자입니다.')
    }
    return sub;
  }
}
