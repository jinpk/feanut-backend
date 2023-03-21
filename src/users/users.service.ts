import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery,
  Model,
  Types,
} from 'mongoose';
import { UserDto } from './dtos';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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

  async findActiveUserById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id);
    if (!user || user.isDeleted) {
      return null;
    }

    return user.toObject();
  }

  async createUserWithEmail(email: string): Promise<string> {
    const user = await new this.userModel({ email }).save();
    return user._id.toHexString();
  }

  async createUserWithKakao(kakaoId: string, email = ''): Promise<string> {
    const user = await new this.userModel({ email, kakaoId }).save();
    return user._id.toHexString();
  }

  async updateKakaoId(
    id: string | Types.ObjectId,
    kakaoId: string,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { $set: { kakaoId } });
  }

  async _userDocToDto(user: User): Promise<UserDto> {
    const dto = new UserDto();
    dto.id = user._id.toHexString();
    dto.profileId = user.profileId?.toHexString();
    dto.email = user.email;
    return dto;
  }
}
