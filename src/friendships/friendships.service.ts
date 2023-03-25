import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Model,
  Types,
  FilterQuery,
  PipelineStage,
  ProjectionFields,
} from 'mongoose';
import { Friend } from './schemas/friend.schema';
import { Friendship, FriendShipDocument } from './schemas/friendships.schema';
import { FriendShipsServiceInterface } from './friendships.interface';
import { AddFriendDto, FriendDto } from './dtos';
import { ProfilesService } from 'src/profiles/profiles.service';
import { WrappedError } from 'src/common/errors';
import { FRIENDSHIPS_MODULE_NAME } from './friendships.constant';
import { UtilsService } from 'src/common/providers';
import { PagingResDto } from 'src/common/dtos';

@Injectable()
export class FriendshipsService implements FriendShipsServiceInterface {
  constructor(
    @InjectModel(Friendship.name)
    private friendShipModel: Model<FriendShipDocument>,
    private profilesService: ProfilesService,
    private utilsService: UtilsService,
  ) {}

  async getFriendsCount(userId: string | Types.ObjectId): Promise<number> {
    const friendship = await this.friendShipModel.findOne(
      {
        userId: new Types.ObjectId(userId),
      },
      {
        count: {
          $size: {
            $filter: {
              input: '$friends',
              as: 'friends',
              cond: {
                $ne: ['$hidden', true],
              },
            },
          },
        },
      },
    );

    return friendship.get('count');
  }

  async initFriendShip(userId: string | Types.ObjectId) {
    await new this.friendShipModel({
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
          FRIENDSHIPS_MODULE_NAME,
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
    const doc = await this.friendShipModel.findOne({
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
    const doc = await this.friendShipModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (
      doc.friends.findIndex((x) => x.profileId.equals(friendProfileId)) >= 0
    ) {
      return true;
    }

    return false;
  }

  async hideFriend(userId: string, friendProfileId: string): Promise<boolean> {
    const doc = await this.friendShipModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    const index = doc.friends.findIndex((x) =>
      x.profileId.equals(friendProfileId),
    );
    if (index < 0) {
      return false;
    }

    doc.friends[index].hidden = true;

    await doc.save();

    return true;
  }

  async unHideFriend(userId: string, friendProfileId: string) {
    const doc = await this.friendShipModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    const index = doc.friends.findIndex((x) =>
      x.profileId.equals(friendProfileId),
    );
    if (index < 0) {
      return false;
    }

    doc.friends[index].hidden = false;

    await doc.save();

    return true;
  }

  async hasFriends(userId: string | Types.ObjectId) {
    const doc = await this.friendShipModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!doc.friends.length) {
      return false;
    }
    return true;
  }

  async listFriend(
    userId: string | Types.ObjectId,
    page?: number,
    limit?: number,
  ): Promise<PagingResDto<Friend>> {
    const paging = page && limit;
    const filter: FilterQuery<Friendship> = {
      userId: new Types.ObjectId(userId),
    };

    const friendFilter: FilterQuery<Friend> = {
      hidden: { $ne: true },
    };

    const projection: ProjectionFields<Friend> = {
      friendshipId: '$_id',
      id: '$friends._id',
      hidden: '$friends.hidden',
      name: '$friends.name',
      profileId: '$friends.profileId',
    };

    const pipeline: PipelineStage[] = [
      // 친구 도큐먼트 조회
      { $match: filter },
      // 친구목록 언와인딩
      {
        $unwind: { path: '$friends' },
      },
      { $project: projection },
      // 숨김친구 필터링
      { $match: friendFilter },
      { $sort: { name: 1 } },
    ];

    if (paging) {
      pipeline.push(this.utilsService.getCommonMongooseFacet({ page, limit }));
      const cursor = await this.friendShipModel.aggregate(pipeline);
      const metdata = cursor[0].metadata;
      const data = cursor[0].data;
      return {
        total: metdata[0]?.total || 0,
        data: data,
      };
    } else {
      const doc = await this.friendShipModel.aggregate<Friend>(pipeline);
      return {
        total: doc.length,
        data: doc,
      };
    }
  }

  async listHiddenFriend(
    userId: string | Types.ObjectId,
    page?: number,
    limit?: number,
  ): Promise<PagingResDto<Friend>> {
    const paging = page && limit;

    const filter: FilterQuery<Friendship> = {
      userId: new Types.ObjectId(userId),
    };

    const friendFilter: FilterQuery<Friend> = {
      hidden: true,
    };

    const projection: ProjectionFields<Friend> = {
      friendshipId: '$_id',
      id: '$friends._id',
      hidden: '$friends.hidden',
      name: '$friends.name',
      profileId: '$friends.profileId',
    };

    const pipeline: PipelineStage[] = [
      // 친구 도큐먼트 조회
      { $match: filter },
      // 친구목록 언와인딩
      {
        $unwind: { path: '$friends' },
      },
      { $project: projection },
      // 숨김친구 필터링
      { $match: friendFilter },
      { $sort: { name: 1 } },
    ];

    if (paging) {
      pipeline.push(this.utilsService.getCommonMongooseFacet({ page, limit }));
      const cursor = await this.friendShipModel.aggregate(pipeline);
      const metdata = cursor[0].metadata;
      const data = cursor[0].data;
      return {
        total: metdata[0]?.total || 0,
        data: data,
      };
    } else {
      const doc = await this.friendShipModel.aggregate<Friend>(pipeline);
      return {
        total: doc.length,
        data: doc,
      };
    }
  }

  _friendDocToDto(friend: Friend): FriendDto {
    const dto = new FriendDto();
    dto.name = friend.name;
    dto.profileId = friend.profileId.toHexString();
    return dto;
  }
}
