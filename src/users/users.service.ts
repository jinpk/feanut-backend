import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
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

  async createAccountWithPhoneNumber(phoneNumber: string): Promise<string> {
    const user = await new this.userModel({ phoneNumber }).save();
    return user._id.toHexString();
  }

  async createAccountWithEmail(email: string): Promise<string> {
    const user = await new this.userModel({ email }).save();
    return user._id.toHexString();
  }
}
