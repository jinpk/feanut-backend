import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WrappedError } from 'src/common/errors';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, '') {
  constructor(
    private configService: ConfigService,
    private authServices: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwtSecret'),
    });
  }

  async validate(payload: any) {
    if (!payload.sub) {
      throw new WrappedError(null, null, '').unauthorized();
    }

    const user = {
      id: payload.sub,
      isAdmin: payload.isAdmin,
    };

    // 탈퇴 회원인지 검증
    if (!user.isAdmin && !(await this.authServices.isValidUserId(user.id))) {
      throw new WrappedError(null, null, '권한 없습니다.').unauthorized();
    }

    return user;
  }
}
