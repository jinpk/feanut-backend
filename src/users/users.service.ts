import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Gender } from 'src/profiles/enums';
import { UserDto } from './dtos';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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

  async findActiveUserById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id);
    if (!user || user.isDeleted) {
      return null;
    }

    return user.toObject();
  }

  // 호출전에 hashedPhoneNumber와 username 존재여부 확인
  async create(
    username: string,
    hashedPhoneNumber: string,
    name: string,
    gender: Gender,
    birth: string,
  ): Promise<string> {
    const user = await new this.userModel({
      username,
      hashedPhoneNumber,
    }).save();

    // 프로필 맵핑 or 생성 필요

    return user._id.toHexString();
  }

  async _userDocToDto(user: User): Promise<UserDto> {
    const dto = new UserDto();
    dto.id = user._id.toHexString();
    dto.username = user.username;
    return dto;
  }
}
