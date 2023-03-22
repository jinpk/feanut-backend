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
} from './dtos';
import { AdminService } from 'src/admin/admin.service';
import { WrappedError } from 'src/common/errors';
import {
  AUTH_ERROR_EXIST_PHONE_NUMBER,
  AUTH_ERROR_EXIST_USERNAME,
  AUTH_ERROR_INVALID_CODE,
  AUTH_ERROR_INVALID_LOGIN,
  AUTH_ERROR_NOT_FOUND_USERNAME,
  AUTH_ERROR_VERIFICATION_TIMEOUT,
  AUTH_MODULE_NAME,
} from './auth.constant';
import { Gender } from 'src/profiles/enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<AuthDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private adminService: AdminService,
  ) {}

  async userLogin(sub: string): Promise<TokenDto> {
    const payload = { sub, isAdmin: false };
    return {
      accessToken: this.genToken(payload, '30d'),
    };
  }

  async adminLogin(body: AdminLoginDto): Promise<TokenDto> {
    const sub = await this.adminService.validateAdmin(
      body.username,
      body.password,
    );
    const payload = { sub, isAdmin: true };
    return {
      accessToken: this.genToken(payload, '1d'),
    };
  }

  async signUpVerification(dto: SignUpVerificationDto): Promise<string> {
    // username 검증
    if (await this.usersService.hasUsername(dto.username)) {
      throw new WrappedError(
        AUTH_MODULE_NAME,
        AUTH_ERROR_EXIST_USERNAME,
      ).alreadyExist();
    }

    // 휴대폰번호 해시
    const hashedPhoneNumber = this.hashPhoneNumber(dto.phoneNumber);

    // 휴대폰번호 검증
    if (await this.usersService.findActiveUserOne({ hashedPhoneNumber })) {
      throw new WrappedError(
        AUTH_MODULE_NAME,
        AUTH_ERROR_EXIST_PHONE_NUMBER,
      ).alreadyExist();
    }

    // 인증코드 처리
    const code = this.genAuthCode();
    const payload = this.genSignUpPayload(
      dto.birth,
      dto.gender as Gender,
      dto.name,
      dto.username,
      hashedPhoneNumber,
    );

    const doc = await new this.authModel({
      code,
      payload,
    }).save();

    // 인증코드 전송
    this.sendSignUpSMS(dto.phoneNumber, code);

    return doc._id.toHexString();
  }

  async signUp(dto: SignUpDto) {
    const auth = await this.authModel.findById(dto.authId);
    if (!auth) {
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
      payload.hashedPhoneNumber,
      payload.name,
      payload.gender,
      payload.birth,
    );

    auth.used = true;
    auth.usedAt = dayjs().toDate();
    auth.save();

    return await this.userLogin(sub);
  }

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
    if (
      !user.password ||
      !(await this.comparePassword(password, user.password))
    ) {
      throw new WrappedError(
        AUTH_MODULE_NAME,
        AUTH_ERROR_INVALID_LOGIN,
      ).unauthorized();
    }

    return user._id.toHexString();
  }

  async checkAuthCoolTime(phoneNumber: string): Promise<boolean> {
    if (
      await this.findAuthIn3MByField({
        hashedPhoneNumber: this.hashPhoneNumber(phoneNumber),
      })
    ) {
      return false;
    }

    return true;
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

  async comparePassword(input: string, hashed: string): Promise<boolean> {
    return true;
  }
  // no error handling
  async sendSignUpSMS(phoneNumber: string, code: string) {
    console.log('send sns to: ', phoneNumber + '. code: ' + code);
    return phoneNumber;
  }

  hashPhoneNumber(phoneNumber: string): string {
    return phoneNumber;
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
    hashedPhoneNumber: string,
  ) {
    return `${username}\n${name}\n${birth}\n${gender}\n${hashedPhoneNumber}`;
  }

  parseSignUpPayload(payload: string): {
    birth: string;
    gender: Gender;
    name: string;
    username: string;
    hashedPhoneNumber: string;
  } {
    const [username, name, birth, gender, hashedPhoneNumber] =
      payload.split('\n');
    return {
      birth,
      gender: gender as Gender,
      name,
      username,
      hashedPhoneNumber,
    };
  }
}
