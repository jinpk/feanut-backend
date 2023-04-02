import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Gender } from 'src/profiles/enums';
import { UserDto } from './dtos';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrybt from 'bcrypt';
import * as dayjs from 'dayjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from './events';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  // 이미 사용중인 feanutId가 존재하는지 확인
  async hasUsername(username: string): Promise<boolean> {
    const user = await this.userModel.findOne({
      username,
    });

    if (user) {
      return true;
    }
    return false;
  }

  async findActiveUserOne(filter: FilterQuery<User>): Promise<User | null> {
    const user = await this.userModel.findOne({
      ...filter,
      isDeleted: false,
    });

    if (!user) {
      return null;
    }

    return user.toObject();
  }

  async findActiveUserById(id: string | Types.ObjectId): Promise<User | null> {
    const user = await this.userModel.findById(id);
    if (!user || user.isDeleted) {
      return null;
    }

    return user.toObject();
  }

  async updateRefreshTokenById(
    id: string | Types.ObjectId,
    refreshToken: string,
  ) {
    await this.userModel.findByIdAndUpdate(id, {
      $set: {
        refreshToken,
      },
    });
  }

  async updatePasswordById(id: string | Types.ObjectId, password: string) {
    await this.userModel.findByIdAndUpdate(id, {
      $set: {
        password: bcrybt.hashSync(password, 10),
      },
    });
  }

  // 호출전에 phoneNumber username 존재여부 확인
  async create(
    username: string,
    phoneNumber: string,
    name: string,
    gender: Gender,
    birth: string,
  ): Promise<string> {
    const user = await new this.userModel({
      username,
      phoneNumber,
    }).save();

    this.eventEmitter.emit(
      UserCreatedEvent.name,
      new UserCreatedEvent(user._id, name, phoneNumber, gender, birth),
    );

    return user._id.toHexString();
  }

  // 탈퇴전 userId 검증은 호출하는 함수에서 선행 필요
  async deleteUser(
    userId: string | Types.ObjectId,
    deletionReason: string,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $set: {
        deletedAt: dayjs().toDate(),
        isDeleted: true,
        deletionReason,
        refreshToken: undefined,
      },
    });
  }

  async _userDocToDto(user: User): Promise<UserDto> {
    const dto = new UserDto();
    dto.id = user._id.toHexString();
    dto.username = user.username;
    return dto;
  }
}
