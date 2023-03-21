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
import { AdminLoginDto, LoginDto, TokenDto } from './dtos';
import { AdminService } from 'src/admin/admin.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<AuthDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
    private adminService: AdminService,
  ) {}

  async adminLogin(body: AdminLoginDto): Promise<TokenDto> {
    console.log(body.password)
    const sub = await this.adminService.validateAdmin(
      body.username,
      body.password,
    );
    const payload = { sub, isAdmin: true };
    return {
      accessToken: this.genToken(payload, '30d'),
    };
  }

  async login(dto: LoginDto): Promise<TokenDto> {
    const sub = await this.usersService.findActiveUserOne({
      feanutId: dto.feanutId,
    });

    // 로그인 data logging
    // auth.logged = true;
    // auth.loggedAt = new Date();
    // await auth.save();

    const isAdmin = false;
    const payload = { sub, isAdmin };
    return {
      accessToken: this.genToken(payload, '30d'),
    };
  }

  async checkAuthCoolTime(phoneNumber: string): Promise<boolean> {
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
      used: { $ne: true },
      createdAt: { $gte: dayjs().subtract(3, 'minutes') },
    });
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