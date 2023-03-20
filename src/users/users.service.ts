import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { UserDto } from './dtos';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findActiveUserOne(
    filter: FilterQuery<UserDocument>,
  ): Promise<User | null> {
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
    console.log(id)
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

  async getActiveFCMUsers(): Promise<string[]> {
    const docs = await this.userModel
      .find()
      .and([
        { fcmToken: { $ne: '' } },
        { fcmToken: { $ne: null } },
        { deleted: false },
      ]);

    return docs.map((doc) => doc.fcmToken);
  }

  async _userToDto(user: UserDocument | User): Promise<UserDto> {
    const dto = new UserDto();
    dto.id = user.id;
    dto.profileId = user.profileId.toHexString()
    dto.email = user.email;
    return dto;
  }
}
