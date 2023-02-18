import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<null | string> {
    const user = await this.usersService.findActiveUserOne({ username });
    if (!user) {
      return null;
    }

    const passwordVerified = await this.usersService.verifyPassword({
      password,
      hashed: user.password,
    });
    if (!passwordVerified) {
      return null;
    }

    return user._id.toString();
  }

  genToken(payload: any, expiresIn: string = '30m'): string {
    return this.jwtService.sign(payload, { expiresIn });
  }
}
