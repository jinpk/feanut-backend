import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WrappedError } from 'src/common/errors';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, '') {
  constructor(private configService: ConfigService) {
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

    return user;
  }
}
