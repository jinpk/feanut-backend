import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { FriendDetail } from './schemas/friend-detail.schema';
import { Friend, FriendDocument } from './schemas/friend.schema';

@Injectable()
export class FriendsService {
  constructor(
    @InjectModel(Friend.name) private friendModel: Model<FriendDocument>,
  ) {}

  // 친구 문서 생성
  async initFriendDocById(friendId: string, profileId) {
    const doc = await new this.friendModel({
      profile: new Types.ObjectId(profileId),
      friends: [],
    }).save();
    await doc._id.toHexString();
  }

  // 친구추가
  async addFriendToList(friendId: string, profileId: string) {
    const doc = await this.friendModel.findById(friendId);
    const friendDetail = new FriendDetail();
    //friendDetail.profile = new Types.ObjectId(profileId);

    /*doc.friends.push({
      //profile: new Types.ObjectId(profileId),
    });*/
    await doc.save();
  }

  // 친구숨김
  async hideFriend(profileId: string, friendProfileId: string) {
    const doc = await this.friendModel.findById(profileId);
    const index = doc.friends.findIndex(
      (x) => x.profile.id === friendProfileId,
    );
    if (index < 0) {
      throw new Error("friend doesn't exist.");
    }
    doc.friends[index].hidden = true;
    await doc.save();
  }

  // 친구숨김해제
  async unHideFriend(profileId: string, friendProfileId: string) {
    const doc = await this.friendModel.findOne({ profile: profileId });
    const index = doc.friends.findIndex(
      (x) => x.profile.id === friendProfileId,
    );
    if (index < 0) {
      throw new Error("friend doesn't exist.");
    }
    doc.friends[index].hidden = false;
    await doc.save();
  }

  // 전체 친구 목록 조회 - 숨김처리하지않은
  async listFriend(
    profileId: string,
    page?: number,
    limit?: number,
  ): Promise<FriendDetail[]> {
    const filter: FilterQuery<Friend> = {
      profile: new Types.ObjectId(profileId),
    };

    const friendFilter: FilterQuery<FriendDetail> = {
      hidden: { $ne: true },
    };

    const doc = await this.friendModel.aggregate<FriendDetail>([
      { $match: filter },
      {
        $unwind: { path: '$friends' },
      },
      { $match: friendFilter },
    ]);

    return doc;
  }

  // 숨김 친구 목록 조회 - 숨김처리하지않은
  async listHiddenFriend(
    profileId: string,
    page?: number,
    limit?: number,
  ): Promise<FriendDetail[]> {
    const filter: FilterQuery<Friend> = {
      profile: new Types.ObjectId(profileId),
    };

    const friendFilter: FilterQuery<FriendDetail> = {
      hidden: true,
    };

    const doc = await this.friendModel.aggregate<FriendDetail>([
      { $match: filter },
      {
        $unwind: { path: '$friends' },
      },
      { $match: friendFilter },
    ]);

    return doc;
  }
}
