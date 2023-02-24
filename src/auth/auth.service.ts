import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FilterQuery, Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import { AuthDocument } from './schemas/auth.schema';
import * as dayjs from 'dayjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private authModel: Model<AuthDocument>,
  ) {}

  async checkEmailLoginCoolTime(email: string): Promise<boolean> {
    if (await this.findAuthIn3MByField({ email })) {
      return false;
    }

    return true;
  }

  async checkPhoneLoginCoolTime(phoneNumber: string): Promise<boolean> {
    if (await this.findAuthIn3MByField({ phoneNumber })) {
      return false;
    }

    return true;
  }

  async findAuthIn3MByField(
    filter: FilterQuery<AuthDocument>,
  ): Promise<AuthDocument | null> {
    return await this.authModel.findOne({
      ...filter,
      createdAt: { $gte: dayjs().subtract(3, 'minutes') },
    });
  }

  async emailLogin(email: string): Promise<string> {
    const doc = await new this.authModel({
      email: email,
      code: this.genAuthCode(),
    }).save();

    return doc._id.toHexString();
  }

  async phoneNumberLogin(phoneNumber: string): Promise<string> {
    const doc = await new this.authModel({
      phoneNumber: phoneNumber,
      code: this.genAuthCode(),
    }).save();

    return doc._id.toHexString();
  }

  genAuthCode(): string {
    return '000000';
  }

  genToken(payload: any, expiresIn = '30m'): string {
    return this.jwtService.sign(payload, { expiresIn });
  }
}
