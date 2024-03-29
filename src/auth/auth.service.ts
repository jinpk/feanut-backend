import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Model, Types } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import { Auth, AuthDocument } from './schemas/auth.schema';
import * as dayjs from 'dayjs';
import { InjectModel } from '@nestjs/mongoose';
import {
  TokenDto,
  SignUpVerificationDto,
  SignUpDto,
  AuthDto,
  SignInVerificationDto,
  SignInDto,
  SignUpVerificationConfirmDto,
} from './dtos';
import { WrappedError } from 'src/common/errors';
import {
  AUTH_ERROR_COOL_TIME,
  AUTH_ERROR_EXIST_PHONE_NUMBER,
  AUTH_ERROR_INVAILD_REFRESH_TOKEN,
  AUTH_ERROR_INVAILD_VERIFICATION,
  AUTH_ERROR_INVALID_CODE,
  AUTH_ERROR_NOT_FOUND_PHONE_NUMBER,
  AUTH_ERROR_NOT_FOUND_USER,
  AUTH_ERROR_VERIFICATION_TIMEOUT,
  AUTH_MODULE_NAME,
} from './auth.constant';
import { AuthPurpose } from './enums';
import { AligoProvider, InstagramProvider } from './providers';
import { ProfilesService } from 'src/profiles/profiles.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SignOutEvent } from './events';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(Auth.name) private authModel: Model<AuthDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private aligoProvider: AligoProvider,
    private instagramProvider: InstagramProvider,
    private profilesService: ProfilesService,
    private eventEmitter: EventEmitter2,
  ) {}

  // 로그아웃
  async signOut(sub: string) {
    this.eventEmitter.emit(SignOutEvent.name, new SignOutEvent(sub));
  }

  // 유효한 회원인지 검증
  async isValidUserId(userId: string | Types.ObjectId): Promise<boolean> {
    if (await this.usersService.findActiveUserById(userId)) {
      return true;
    }
    return false;
  }

  // 인스타그램 로그인 검증 및 username 업데이트
  async authInstagram(code: string, state: string) {
    // state 프로필 ID 검증
    const profileId = new Types.ObjectId(state);
    if (!(await this.profilesService.getById(profileId))) {
      throw new WrappedError(AUTH_MODULE_NAME).badRequest();
    }

    try {
      const username = await this.instagramProvider.parseCode(code);
      await this.profilesService.updateInstagramById(profileId, username);
    } catch (error) {
      this.logger.error(JSON.stringify(`인스타그램 연동 오류: ${error}`));
      throw new WrappedError(AUTH_MODULE_NAME);
    }
  }

  // 리프레시 토큰 검증 및 token 재발급
  async validateRefreshToken(refreshToken: string): Promise<TokenDto> {
    try {
      await this.jwtService.verify(refreshToken);
      const user = await this.usersService.findActiveUserOne({ refreshToken });
      if (!user) {
        throw new Error('Not Found active user');
      }
      return this.userLogin(user._id.toHexString());
    } catch (error) {
      this.logger.error(`validateRefreshToken error: ${JSON.stringify(error)}`);
      throw new WrappedError(
        AUTH_MODULE_NAME,
        AUTH_ERROR_INVAILD_REFRESH_TOKEN,
        error.message || JSON.stringify(error),
      ).reject();
    }
  }

  // 사용자 로그인후 토큰 발급
  async userLogin(sub: string): Promise<TokenDto> {
    const payload = {
      sub,
      isAdmin: false,
    };

    this.logger.log(`userLogin: ${sub}`);

    const accessToken = this.genToken(payload, '1h');
    const refreshToken = this.genToken({}, '14d');

    await this.usersService.updateRefreshTokenById(sub, refreshToken);
    return {
      accessToken,
      refreshToken,
    };
  }

  // 1. 로그인 인증 요청
  async signInVerification(dto: SignInVerificationDto): Promise<AuthDto> {
    const user = await this.usersService.findActiveUserOne({
      phoneNumber: dto.phoneNumber,
    });

    if (!user) {
      throw new WrappedError(
        AUTH_MODULE_NAME,
        AUTH_ERROR_NOT_FOUND_PHONE_NUMBER,
      ).notFound();
    }

    // 쿨타임
    await this.requireAuthCoolTime(dto.phoneNumber);

    // 인증코드 처리
    const code = dto.phoneNumber.startsWith('000000000')
      ? '000000'
      : this.genAuthCode();

    const doc = await new this.authModel({
      code,
      payload: user._id.toHexString(),
      purpose: AuthPurpose.SignIn,
      phoneNumber: dto.phoneNumber,
    }).save();

    // 인증코드 전송
    this.sendLoginSMS(dto.phoneNumber, code);

    return { authId: doc._id.toHexString() };
  }

  // 2. 로그인
  async signIn(dto: SignInDto) {
    const auth = await this.authModel.findById(dto.authId);
    if (!auth || auth.used) {
      throw new WrappedError(AUTH_MODULE_NAME).reject();
    }

    if (dayjs(auth.createdAt).isBefore(dayjs().subtract(3, 'minutes'))) {
      throw new WrappedError(
        AUTH_MODULE_NAME,
        AUTH_ERROR_VERIFICATION_TIMEOUT,
      ).reject();
    }

    if (dto.code !== auth.code) {
      throw new WrappedError(
        AUTH_MODULE_NAME,
        AUTH_ERROR_INVALID_CODE,
      ).badRequest();
    }

    const user = await this.usersService.findActiveUserById(auth.payload);
    if (!user) {
      throw new WrappedError(
        AUTH_MODULE_NAME,
        AUTH_ERROR_NOT_FOUND_USER,
      ).reject();
    }

    auth.used = true;
    auth.usedAt = dayjs().toDate();
    auth.save();

    return await this.userLogin(user._id.toHexString());
  }

  // 1. 회원가입 인증 요청
  async signUpVerification(dto: SignUpVerificationDto): Promise<AuthDto> {
    // 휴대폰번호 검증
    if (
      await this.usersService.findActiveUserOne({
        phoneNumber: dto.phoneNumber,
      })
    ) {
      throw new WrappedError(
        AUTH_MODULE_NAME,
        AUTH_ERROR_EXIST_PHONE_NUMBER,
      ).alreadyExist();
    }

    // 3분 쿨타임
    await this.requireAuthCoolTime(dto.phoneNumber);

    // 인증코드 처리
    const code = dto.phoneNumber.startsWith('000000000')
      ? '000000'
      : this.genAuthCode();

    // 인증코드 저장
    const doc = await new this.authModel({
      code,
      purpose: AuthPurpose.SignUp,
      phoneNumber: dto.phoneNumber,
    }).save();

    // 인증코드 전송
    this.sendSignUpSMS(dto.phoneNumber, code);

    return { authId: doc._id.toHexString() };
  }

  // 2. 회원가입 인증코드 확인 처리
  async signUpVerificationConfirm(dto: SignUpVerificationConfirmDto) {
    const auth = await this.authModel.findById(dto.authId);
    if (!auth || auth.used) {
      throw new WrappedError(
        AUTH_MODULE_NAME,
        AUTH_ERROR_INVAILD_VERIFICATION,
      ).reject();
    }

    if (dayjs(auth.createdAt).isBefore(dayjs().subtract(3, 'minutes'))) {
      throw new WrappedError(
        AUTH_MODULE_NAME,
        AUTH_ERROR_VERIFICATION_TIMEOUT,
      ).reject();
    }

    if (dto.code !== auth.code) {
      throw new WrappedError(
        AUTH_MODULE_NAME,
        AUTH_ERROR_INVALID_CODE,
      ).badRequest();
    }

    // 휴대폰번호 검증
    if (
      await this.usersService.findActiveUserOne({
        phoneNumber: auth.phoneNumber,
      })
    ) {
      throw new WrappedError(
        AUTH_MODULE_NAME,
        AUTH_ERROR_EXIST_PHONE_NUMBER,
      ).alreadyExist();
    }

    auth.verified = true;
    auth.save();
  }

  // 3. 회원가입
  async signUp(dto: SignUpDto) {
    const auth = await this.authModel.findById(dto.authId);
    if (!auth || auth.used || !auth.verified) {
      throw new WrappedError(
        AUTH_MODULE_NAME,
        AUTH_ERROR_INVAILD_VERIFICATION,
      ).reject();
    }

    // 휴대폰번호 재확인
    if (
      await this.usersService.findActiveUserOne({
        phoneNumber: auth.phoneNumber,
      })
    ) {
      throw new WrappedError(
        AUTH_MODULE_NAME,
        AUTH_ERROR_EXIST_PHONE_NUMBER,
      ).alreadyExist();
    }

    const sub = await this.usersService.create(
      auth.phoneNumber,
      dto.name,
      dto.gender,
      dto.school?.code,
      dto.school?.grade,
      dto.school?.room,
      dto.referralUserId,
    );

    auth.used = true;
    auth.usedAt = dayjs().toDate();
    auth.save();

    return await this.userLogin(sub);
  }

  // 인증 쿨타임
  async requireAuthCoolTime(phoneNumber: string) {
    // 10초 서비스 커지면 조정 필요
    const latestAuth = await this.authModel.findOne({
      phoneNumber,
      used: { $ne: true },
      createdAt: { $gte: dayjs().subtract(10, 'seconds') },
    });

    if (latestAuth) {
      throw new WrappedError(
        AUTH_MODULE_NAME,
        AUTH_ERROR_COOL_TIME,
        '잠시후 다시 시도해 주세요.',
      );
    }
  }

  async sendSignUpSMS(phoneNumber: string, code: string) {
    await this.aligoProvider.sendSMS(
      phoneNumber,
      `[인증번호:${code}] feanut - 피넛 회원가입 인증번호입니다.`,
    );
  }

  async sendLoginSMS(phoneNumber: string, code: string) {
    await this.aligoProvider.sendSMS(
      phoneNumber,
      `[인증번호:${code}] feanut - 피넛 로그인 인증번호입니다.`,
    );
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
