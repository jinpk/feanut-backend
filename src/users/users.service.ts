import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Gender } from 'src/profiles/enums';
import { UserDto } from './dtos';
import { User, UserDocument } from './schemas/user.schema';
import * as dayjs from 'dayjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from './events';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

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

  // 호출전에 phoneNumber 존재여부 확인
  async create(
    phoneNumber: string,
    name: string,
    gender: Gender,
  ): Promise<string> {
    const user = await new this.userModel({
      phoneNumber,
    }).save();

    this.eventEmitter.emit(
      UserCreatedEvent.name,
      new UserCreatedEvent(user._id, name, phoneNumber, gender),
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
    return dto;
  }
}
