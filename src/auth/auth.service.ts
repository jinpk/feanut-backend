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
import { KakaoAuthProvider } from './providers/kakao.provider';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<AuthDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
    private kakaoAuthProvider: KakaoAuthProvider,
  ) {}

  async kakaoLogin(accessToken: string): Promise<TokenDto> {
    const kakaoProfile = await this.kakaoAuthProvider.me(accessToken);

    const userById = await this.usersService.findActiveUserOne({
      kakaoId: kakaoProfile.id,
    });

    let sub = '';
    let needSignUp = false;

    if (userById) {
      sub = userById._id.toHexString();
    } else {
      if (kakaoProfile.email) {
        const userByEmail = await this.usersService.findActiveUserOne({
          email: kakaoProfile.email,
        });
        // 기존 가입했던 email이 있다면 id update
        if (userByEmail) {
          sub = userByEmail._id.toHexString();
          await this.usersService.updateKakaoId(
            userByEmail._id,
            kakaoProfile.id,
          );
        } else {
          needSignUp = true;
        }
      } else {
        needSignUp = true;
      }
    }

    if (needSignUp) {
      sub = await this.usersService.createUserWithKakao(
        kakaoProfile.id,
        kakaoProfile.email,
      );
    }

    const payload = { sub, isAdmin: false };
    return {
      accessToken: this.genToken(payload, '30d'),
    };
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

    const user = await this.usersService.findActiveUserOne({
      email: auth.email,
    });
    // 자동 회원가입
    const sub = user
      ? user._id
      : await this.usersService.createUserWithEmail(auth.email);

    // 로그인 data logging
    auth.logged = true;
    auth.loggedAt = new Date();
    await auth.save();

    const payload = { sub, isAdmin: false };
    return {
      accessToken: this.genToken(payload, '30d'),
    };
  }

  // async adminLogin(dto: AdminLoginDto): Promise<TokenDto> {
  //   const sub = await this.adminService.validateAdmin(dto.username, dto.password);
  //   const isAdmin = true;
  //   const payload = {sub, isAdmin}
  //   console.log(sub)
  //   return {
  //     accessToken: this.genToken(
  //       payload,
  //       '30d',
  //     ),
  //   };
  // }

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
    const length = 6;
    return Math.floor(
      Math.pow(10, length - 1) +
        Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1),
    ).toString();
  }

  genToken(payload: any, expiresIn = '30m'): string {
    return this.jwtService.sign(payload, { expiresIn });
  }
}
