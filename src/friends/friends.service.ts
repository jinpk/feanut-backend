import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Friend } from './schemas/friend.schema';
import {
  ProfileFriends,
  ProfileFriendsDocument,
} from './schemas/profile-friends.schema';
import { FriendsServiceInterface } from './friends.interface';

@Injectable()
export class FriendsService implements FriendsServiceInterface {
  constructor(
    @InjectModel(ProfileFriends.name)
    private profileFriendsModel: Model<ProfileFriendsDocument>,
  ) {}

  async initProfileFriendsById(profileId: string) {
    await new this.profileFriendsModel({
      profileId: new Types.ObjectId(profileId),
      friends: [],
    }).save();
  }

  async addFriendToList(profileId: string, friendProfileId: string) {
    const doc = await this.profileFriendsModel.findOne({
      profile: new Types.ObjectId(profileId),
    });

    doc.friends.push({
      profileId: new Types.ObjectId(friendProfileId),
    });

    await doc.save();
  }

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

  async unHideFriend(profileId: string, friendProfileId: string) {
    const doc = await this.profileFriendsModel.findOne({ profile: profileId });
    const index = doc.friends.findIndex((x) =>
      x.profileId.equals(friendProfileId),
    );
    if (index < 0) {
      throw new Error("friend doesn't exist.");
    }
    doc.friends[index].hidden = false;
    await doc.save();
  }

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
