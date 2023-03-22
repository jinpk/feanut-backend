import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Friend } from './schemas/friend.schema';
import {
  UserFriends,
  UserFriendsDocument,
} from './schemas/user-friends.schema';
import { FriendsServiceInterface } from './friends.interface';
import { AddFriendDto } from './dtos';
import { ProfilesService } from 'src/profiles/profiles.service';
import { WrappedError } from 'src/common/errors';
import { FRIENDS_MODULE_NAME } from './friends.constant';

@Injectable()
export class FriendsService implements FriendsServiceInterface {
  constructor(
    @InjectModel(UserFriends.name)
    private userFriendsModel: Model<UserFriendsDocument>,
    private profilesService: ProfilesService,
  ) {}

  async initUserFriendsById(userId: string | Types.ObjectId) {
    await new this.userFriendsModel({
      userId: new Types.ObjectId(userId),
      friends: [],
    }).save();
  }

  async addFriendWithCheck(userId: string | Types.ObjectId, dto: AddFriendDto) {
    // 프로필 조회
    let profileId = await this.profilesService.getIdByPhoneNumber(
      dto.phoneNumber,
    );

    // 휴대폰번호로 이미 생성된 프로필 없다면 empty profile 생성
    if (!profileId) {
      profileId = await this.profilesService.createWithPhoneNumber(
        dto.phoneNumber,
      );
    } else {
      // 이미 추가된 친구인지 검증
      if (await this.hasFriend(userId, profileId)) {
        throw new WrappedError(
          FRIENDS_MODULE_NAME,
          null,
          'already added friend ',
        ).alreadyExist();
      }
    }

    await this.addFriendToList(userId, profileId, dto.name);
  }

  async addFriendToList(
    userId: string | Types.ObjectId,
    friendProfileId: string | Types.ObjectId,
    name: string,
  ) {
    const doc = await this.userFriendsModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    doc.friends.push({
      profileId: new Types.ObjectId(friendProfileId),
      name,
    });

    await doc.save();
  }

  async hasFriend(
    userId: string | Types.ObjectId,
    friendProfileId: string | Types.ObjectId,
  ) {
    const doc = await this.userFriendsModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (
      doc.friends.findIndex((x) => x.profileId.equals(friendProfileId)) >= 0
    ) {
      return true;
    }

    return false;
  }

  async hideFriend(userId: string, friendProfileId: string) {}

  async unHideFriend(userId: string, friendProfileId: string) {}

  async listFriend(userId: string | Types.ObjectId): Promise<Friend[]> {
    const filter: FilterQuery<UserFriends> = {
      userId: new Types.ObjectId(userId),
    };

    const friendFilter: FilterQuery<Friend> = {
      hidden: { $ne: true },
    };

    const doc = await this.userFriendsModel.aggregate<Friend>([
      // 친구 도큐먼트 조회
      { $match: filter },
      // 친구목록 언와인딩
      {
        $unwind: { path: '$friends' },
      },
      // 숨김친구 필터링
      { $match: friendFilter },
    ]);

    return doc;
  }

  async listHiddenFriend(userId: string | Types.ObjectId): Promise<Friend[]> {
    const filter: FilterQuery<UserFriends> = {
      userId: new Types.ObjectId(userId),
    };

    const friendFilter: FilterQuery<Friend> = {
      hidden: true,
    };

    const doc = await this.userFriendsModel.aggregate<Friend>([
      // 친구 도큐먼트 조회
      { $match: filter },
      // 친구목록 언와인딩
      {
        $unwind: { path: '$friends' },
      },
      // 숨김친구 필터링
      { $match: friendFilter },
    ]);

    return doc;
  }
}
