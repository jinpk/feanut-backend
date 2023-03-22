import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FilterQuery, Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import { Auth, AuthDocument } from './schemas/auth.schema';
import * as dayjs from 'dayjs';
import { InjectModel } from '@nestjs/mongoose';
import {
  AdminLoginDto,
  TokenDto,
  SignUpVerificationDto,
  SignUpDto,
  ResetPasswordVerificationDto,
  ResetPasswordDto,
  ResetPasswordVerificationCodeDto,
} from './dtos';
import { AdminService } from 'src/admin/admin.service';
import { WrappedError } from 'src/common/errors';
import {
  AUTH_ERROR_COOL_TIME,
  AUTH_ERROR_EXIST_PHONE_NUMBER,
  AUTH_ERROR_EXIST_USERNAME,
  AUTH_ERROR_INVALID_CODE,
  AUTH_ERROR_INVALID_LOGIN,
  AUTH_ERROR_NOT_FOUND_USERNAME,
  AUTH_ERROR_VERIFICATION_TIMEOUT,
  AUTH_MODULE_NAME,
} from './auth.constant';
import { Gender } from 'src/profiles/enums';
import * as bcrypt from 'bcrypt';
import { AuthPurpose } from './enums';
import { AligoProvider } from './providers';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<AuthDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private adminService: AdminService,
    private aligoProvider: AligoProvider,
  ) {}

  // 리프레시 토큰 검증 및 token 재발급
  async validateRefreshToken(refreshToken: string): Promise<TokenDto> {
    await this.jwtService.verify(refreshToken);

    const user = await this.usersService.findActiveUserOne({ refreshToken });
    if (!user) {
      throw new WrappedError(AUTH_MODULE_NAME).unauthorized();
    }

    return this.userLogin(user._id.toHexString());
  }

  // 비밀번호 초기화 인증 요청
  async resetPasswordVerification(
    dto: ResetPasswordVerificationDto,
  ): Promise<string> {
    const user = await this.usersService.findActiveUserOne({
      username: dto.username,
      phoneNumber: dto.phoneNumber,
    });

    if (!user) {
      throw new WrappedError(AUTH_MODULE_NAME).reject();
    }

    // 3분 쿨타임
    await this.require3MCoolTime(user.phoneNumber);

    // 인증코드 처리
    const code = this.genAuthCode();
    const doc = await new this.authModel({
      code,
      payload: dto.username,
      purpose: AuthPurpose.ResetPassword,
      phoneNumber: user.phoneNumber,
    }).save();

    // 인증코드 전송
    this.sendResetPasswordSMS(dto.phoneNumber, code);

    return doc._id.toHexString();
  }

  // 비밀번호 초기화 인증코드 검증
  async resetPasswordVerificationCode(dto: ResetPasswordVerificationCodeDto) {
    const auth = await this.authModel.findById(dto.authId);
    // 이미 인증했으면 reject
    if (!auth || auth.verified) {
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

    auth.verified = true;
    await auth.save();
  }

  // 비밀번호 초기화
  async resetPassword(dto: ResetPasswordDto) {
    const auth = await this.authModel.findById(dto.authId);
    // 검증되지 않았거나 이미 사용한 인증은 reject
    if (!auth || !auth.verified || auth.used) {
      throw new WrappedError(AUTH_MODULE_NAME).reject();
    }

    if (dayjs(auth.createdAt).isBefore(dayjs().subtract(3, 'minutes'))) {
      throw new WrappedError(
        AUTH_MODULE_NAME,
        AUTH_ERROR_VERIFICATION_TIMEOUT,
      ).reject();
    }

    const user = await this.usersService.findActiveUserOne({
      username: auth.payload,
    });
    await this.usersService.updatePasswordById(user._id, dto.password);

    auth.used = true;
    auth.usedAt = dayjs().toDate();
    await auth.save();
  }

  // 로그인
  async validate(username: string, password: string): Promise<string> {
    // 아이디 검증
    if (!(await this.usersService.hasUsername(username))) {
      throw new WrappedError(
        AUTH_MODULE_NAME,
        AUTH_ERROR_NOT_FOUND_USERNAME,
      ).notFound();
    }

    const user = await this.usersService.findActiveUserOne({
      username,
    });

    // 비밀번호 검증
    if (!user.password || !this.comparePassword(password, user.password)) {
      throw new WrappedError(
        AUTH_MODULE_NAME,
        AUTH_ERROR_INVALID_LOGIN,
      ).unauthorized();
    }

    return user._id.toHexString();
  }

  // 사용자 로그인후 토큰 발급
  async userLogin(sub: string): Promise<TokenDto> {
    const payload = { sub, isAdmin: false };

    const accessToken = this.genToken(payload, '30m');
    const refreshToken = this.genToken({}, '2w');

    await this.usersService.updateRefreshTokenById(sub, refreshToken);
    return {
      accessToken,
      refreshToken,
    };
  }

  // 관리자 로그인
  async adminLogin(body: AdminLoginDto): Promise<TokenDto> {
    const sub = await this.adminService.validateAdmin(
      body.username,
      body.password,
    );
    const payload = { sub, isAdmin: true };
    return {
      accessToken: this.genToken(payload, '1d'),
      refreshToken: '',
    };
  }

  // 회원가입 인증 요청
  async signUpVerification(dto: SignUpVerificationDto): Promise<string> {
    // username 검증
    if (await this.usersService.hasUsername(dto.username)) {
      throw new WrappedError(
        AUTH_MODULE_NAME,
        AUTH_ERROR_EXIST_USERNAME,
      ).alreadyExist();
    }

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
    await this.require3MCoolTime(dto.phoneNumber);

    // 인증코드 처리
    const code = this.genAuthCode();
    const payload = this.genSignUpPayload(
      dto.birth,
      dto.gender as Gender,
      dto.name,
      dto.username,
    );

    const doc = await new this.authModel({
      code,
      payload,
      purpose: AuthPurpose.SignUp,
      phoneNumber: dto.phoneNumber,
    }).save();

    // 인증코드 전송
    this.sendSignUpSMS(dto.phoneNumber, code);

    return doc._id.toHexString();
  }

  // 회원가입
  async signUp(dto: SignUpDto) {
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

    const payload = this.parseSignUpPayload(auth.payload);

    // username 검증
    if (await this.usersService.hasUsername(payload.username)) {
      throw new WrappedError(
        AUTH_MODULE_NAME,
        AUTH_ERROR_EXIST_USERNAME,
      ).alreadyExist();
    }

    const sub = await this.usersService.create(
      payload.username,
      auth.phoneNumber,
      payload.name,
      payload.gender,
      payload.birth,
    );

    auth.used = true;
    auth.usedAt = dayjs().toDate();
    auth.save();

    return await this.userLogin(sub);
  }

  // 3분 이내 데이터 있는 경우 throw Excepction
  async require3MCoolTime(phoneNumber: string) {
    if (
      await this.findAuthIn3MByField({
        phoneNumber,
      })
    ) {
      throw new WrappedError(
        AUTH_MODULE_NAME,
        AUTH_ERROR_COOL_TIME,
        '잠시후 다시 시도해 주세요.',
      );
    }
  }

  async findAuthIn3MByField(
    filter: FilterQuery<AuthDocument>,
  ): Promise<AuthDocument | null> {
    return await this.authModel.findOne({
      ...filter,
      used: { $ne: true },
      createdAt: { $gte: dayjs().subtract(3, 'minutes') },
    });
  }

  // no error handling
  async sendSignUpSMS(phoneNumber: string, code: string) {
    await this.aligoProvider.sendSMS(
      phoneNumber,
      `[인증번호:${code}] feanut - 피넛 회원가입 인증번호입니다.`,
    );
  }

  async sendResetPasswordSMS(phoneNumber: string, code: string) {
    await this.aligoProvider.sendSMS(
      phoneNumber,
      `[인증번호:${code}] feanut - 피넛 비밀번호 재설정 인증번호입니다.`,
    );
  }

  comparePassword(input: string, hashed: string): boolean {
    return bcrypt.compareSync(input, hashed);
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

  genSignUpPayload(
    birth: string,
    gender: Gender,
    name: string,
    username: string,
  ) {
    return `${username}\n${name}\n${birth}\n${gender}`;
  }

  parseSignUpPayload(payload: string): {
    birth: string;
    gender: Gender;
    name: string;
    username: string;
  } {
    const [username, name, birth, gender] = payload.split('\n');
    return {
      birth,
      gender: gender as Gender,
      name,
      username,
    };
  }
}
