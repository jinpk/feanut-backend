import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Friend } from './schemas/friend.schema';
import {
  ProfileFriends,
  ProfileFriendsDocument,
} from './schemas/profile-friends.schema';

@Injectable()
export class FriendsService {
  constructor(
    @InjectModel(ProfileFriends.name)
    private profileFriendsModel: Model<ProfileFriendsDocument>,
  ) {}

  // 친구 문서 생성
  async initProfileFriendsById(profileId: string) {
    const doc = await new this.profileFriendsModel({
      profileId: new Types.ObjectId(profileId),
      friends: [],
    }).save();
    await doc._id.toHexString();
  }

  // 친구추가
  async addFriendToList(profileId: string, friendProfileId: string) {
    const doc = await this.profileFriendsModel.findOne({
      profile: new Types.ObjectId(profileId),
    });

    doc.friends.push({
      profileId: new Types.ObjectId(friendProfileId),
    });

    await doc.save();
  }

  // 친구숨김
  async hideFriend(profileId: string, friendProfileId: string) {
    const doc = await this.profileFriendsModel.findById(profileId);
    const index = doc.friends.findIndex((x) =>
      x.profileId.equals(friendProfileId),
    );
    if (index < 0) {
      throw new Error("friend doesn't exist.");
    }
    doc.friends[index].hidden = true;
    await doc.save();
  }

  // 친구숨김해제
  async unHideFriend(profileId: string, friendProfileId: string) {
    const doc = await this.profileFriendsModel.findOne({ profile: profileId });
    const index = doc.friends.findIndex(
      (x) => (x) => x.profile.id === friendProfileId,
    );
    if (index < 0) {
      throw new Error("friend doesn't exist.");
    }
    doc.friends[index].hidden = false;
    await doc.save();
  }

  // 전체 친구 목록 조회 - 숨김처리하지않은
  async listFriend(profileId: string): Promise<Friend[]> {
    const filter: FilterQuery<Friend> = {
      profileId: new Types.ObjectId(profileId),
    };

    const friendFilter: FilterQuery<Friend> = {
      hidden: { $ne: true },
    };

    const doc = await this.profileFriendsModel.aggregate<Friend>([
      { $match: filter },
      {
        $unwind: { path: '$friends' },
      },
      { $match: friendFilter },
    ]);

    return doc;
  }

  // 숨김 친구 목록 조회 - 숨김처리하지않은
  async listHiddenFriend(profileId: string): Promise<Friend[]> {
    const filter: FilterQuery<Friend> = {
      profileId: new Types.ObjectId(profileId),
    };

    const friendFilter: FilterQuery<Friend> = {
      hidden: true,
    };

    const doc = await this.profileFriendsModel.aggregate<Friend>([
      { $match: filter },
      {
        $unwind: { path: '$friends' },
      },
      { $match: friendFilter },
    ]);

    return doc;
  }
}
