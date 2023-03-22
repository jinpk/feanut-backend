import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Friend } from './schemas/friend.schema';
import {
  UserFriends,
  UserFriendsDocument,
} from './schemas/user-friends.schema';
import { FriendsServiceInterface } from './friends.interface';

@Injectable()
export class FriendsService implements FriendsServiceInterface {
  constructor(
    @InjectModel(UserFriends.name)
    private userFriendsModel: Model<UserFriendsDocument>,
  ) {}

  async initUserFriendsById(userId: string | Types.ObjectId) {
    await new this.userFriendsModel({
      userId: new Types.ObjectId(userId),
      friends: [],
    }).save();
  }

  async addFriendToList(
    userId: string | Types.ObjectId,
    friendProfileId: string,
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

  async hideFriend(profileId: string, friendProfileId: string) {
    const doc = await this.userFriendsModel.findById(profileId);
    const index = doc.friends.findIndex((x) =>
      x.profileId.equals(friendProfileId),
    );
    if (index < 0) {
      throw new Error("friend doesn't exist.");
    }
    doc.friends[index].hidden = true;
    await doc.save();
  }

  async unHideFriend(profileId: string, friendProfileId: string) {
    const doc = await this.userFriendsModel.findOne({ profile: profileId });
    const index = doc.friends.findIndex((x) =>
      x.profileId.equals(friendProfileId),
    );
    if (index < 0) {
      throw new Error("friend doesn't exist.");
    }
    doc.friends[index].hidden = false;
    await doc.save();
  }

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

  async listHiddenFriend(profileId: string): Promise<Friend[]> {
    const filter: FilterQuery<Friend> = {
      profileId: new Types.ObjectId(profileId),
    };

    const friendFilter: FilterQuery<Friend> = {
      hidden: true,
    };

    const doc = await this.userFriendsModel.aggregate<Friend>([
      { $match: filter },
      {
        $unwind: { path: '$friends' },
      },
      { $match: friendFilter },
    ]);

    return doc;
  }
}
