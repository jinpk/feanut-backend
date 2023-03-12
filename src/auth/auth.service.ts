import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FilterQuery, Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import { Auth, AuthDocument } from './schemas/auth.schema';
import * as dayjs from 'dayjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmailLoginEvent } from './events';
import { InjectModel } from '@nestjs/mongoose';
import { LoginDto, TokenDto } from './dtos';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(Auth.name) private authModel: Model<AuthDocument>,
    private eventEmitter: EventEmitter2,
  ) { }

  async kakaoLogin(accessToken: string): Promise<TokenDto> {
  }

  async login(dto: LoginDto): Promise<TokenDto> {
    // 유효한 인증인지 확인
    const auth = await this.authModel.findById(dto.authId);
    if (
      !auth ||
      auth.logged ||
      dayjs(auth.createdAt).isBefore(dayjs().subtract(3, 'minutes'))
    ) {
      throw new NotAcceptableException();
    }

    // 코드 확인
    if (auth.code !== dto.code) {
      throw new BadRequestException();
    }

    const user = await this.usersService.findActiveUserOne(
      auth.email ? { email: auth.email } : { phoneNumber: auth.phoneNumber },
    );

    let sub: string;

    // 자동 회원가입
    if (!user) {
      sub = auth.email
        ? await this.usersService.createAccountWithEmail(auth.email)
        : await this.usersService.createAccountWithEmail(auth.phoneNumber);
    } else {
      sub = user.id;
    }

    // 로그인 data logging
    auth.logged = true;
    auth.loggedAt = new Date();
    await auth.save();

    return {
      accessToken: this.genToken(
        {
          sub,
        },
        '30d',
      ),
    };
  }

  async checkEmailLoginCoolTime(email: string): Promise<boolean> {
    if (await this.findAuthIn3MByField({ email })) {
      return false;
    }

    return true;
  }

  async findAuthIn3MByField(
    filter: FilterQuery<AuthDocument>,
  ): Promise<AuthDocument | null> {
    return await this.authModel.findOne({
      ...filter,
      logged: { $ne: true },
      createdAt: { $gte: dayjs().subtract(3, 'minutes') },
    });
  }

  async emailLogin(email: string): Promise<string> {
    const doc = await new this.authModel({
      email: email,
      code: this.genAuthCode(),
    }).save();

    this.eventEmitter.emit(
      EmailLoginEvent.name,
      new EmailLoginEvent(doc.email, doc.code),
    );
    return doc._id.toHexString();
  }

  genAuthCode(): string {
    return '000000';
  }

  genToken(payload: any, expiresIn = '30m'): string {
    return this.jwtService.sign(payload, { expiresIn });
  }
}
