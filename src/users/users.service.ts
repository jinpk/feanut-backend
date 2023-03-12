import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { ProfilesService } from 'src/profiles/profiles.service';
import { UserDto } from './dtos';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private profilesService: ProfilesService,
  ) {}

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
    const user = await this.userModel.findById(id);
    if (!user || user.isDeleted) {
      return null;
    }

    return user.toObject();
  }

  async createUserWithEmail(email: string): Promise<string> {
    const user = await new this.userModel({ email }).save();

    // 프로필 생성
    try {
      const profileId = await this.profilesService.createEmptyProfile();
      user.profileId = new Types.ObjectId(profileId);
      await user.save();
    } catch (error) {
      user.delete();
    }

    return user._id.toHexString();
  }

  async _userToDto(user: UserDocument | User): Promise<UserDto> {
    const dto = new UserDto();
    dto.id = user.id;
    dto.profileId = user.profileId.toHexString();
    dto.email = user.email;
    return dto;
  }
}
