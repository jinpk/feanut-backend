import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Gender } from 'src/profiles/enums';
import { UserDto } from './dtos';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrybt from 'bcrypt';
import { ProfilesService } from 'src/profiles/profiles.service';
import { FriendShipsService } from 'src/friendships/friendships.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private profilesService: ProfilesService,
    private friendShipsService: FriendShipsService,
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

  async findActiveUserById(id: string): Promise<User | null> {
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

  // 호출전에 hashedPhoneNumber와 username 존재여부 확인
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

    const profileId =
      await this.profilesService.getOwnerLessProfileByPhoneNumber(phoneNumber);

    // 프로필 정보 맵핑 | 생성
    if (profileId) {
      await this.profilesService.makeOwnerShipById(
        profileId,
        user._id,
        name,
        gender,
        birth,
      );
    } else {
      await this.profilesService.create(
        user._id,
        phoneNumber,
        name,
        gender,
        birth,
      );
    }

    // 친구목록 초기화
    await this.friendShipsService.initFriendShip(user._id);

    return user._id.toHexString();
  }

  async _userDocToDto(user: User): Promise<UserDto> {
    const dto = new UserDto();
    dto.id = user._id.toHexString();
    dto.username = user.username;
    return dto;
  }
}
