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
import { AddFriendDto, FriendDto } from './dtos';
import { ProfilesService } from 'src/profiles/profiles.service';
import { WrappedError } from 'src/common/errors';
import { FRIENDSHIPS_MODULE_NAME } from './friendships.constant';
import { UtilsService } from 'src/common/providers';
import { PagingResDto } from 'src/common/dtos';
import { PROFILE_SCHEMA_NAME } from 'src/profiles/profiles.constant';
import { USER_SCHEMA_NAME } from 'src/users/users.constant';
import { FILE_SCHEMA_NAME } from 'src/files/files.constant';
import { ListFriendParams } from './interfaces';

@Injectable()
export class FriendshipsService {
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
        friends: 1,
        count: {
          $size: {
            $filter: {
              input: '$friends',
              as: 'friends',
              cond: {
                $ne: ['$$friends.hidden', true],
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
      // 탈퇴하지 않은 오너의 프로필만 조회하고 없다면 새롭게 생성
      // 다음 회원가입하는 휴대폰번호 소유자가 투표를 가져갈 것 임.
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
    params: ListFriendParams = {},
  ): Promise<PagingResDto<FriendDto>> {
    const paging = params.page && params.limit;

    const filter: FilterQuery<Friendship> = {
      userId: new Types.ObjectId(userId),
    };

    const unwind: PipelineStage.Unwind['$unwind'] = {
      path: '$friends',
    };

    const match: FilterQuery<Friend> = {
      $expr: {
        [params.hidden ? '$eq' : '$ne']: ['$friends.hidden', true],
      },
    };

    const lookupProfile: PipelineStage.Lookup['$lookup'] = {
      from: PROFILE_SCHEMA_NAME,
      localField: 'friends.profileId',
      foreignField: '_id',
      as: 'profile',
    };

    const unwindProfile: PipelineStage.Unwind['$unwind'] = {
      path: '$profile',
    };

    const lookupUser: PipelineStage.Lookup['$lookup'] = {
      from: USER_SCHEMA_NAME,
      localField: 'profile.ownerId',
      foreignField: '_id',
      as: 'user',
    };

    const unwindUser: PipelineStage.Unwind['$unwind'] = {
      path: '$user',
    };

    const lookupFile: PipelineStage.Lookup['$lookup'] = {
      from: FILE_SCHEMA_NAME,
      localField: 'profile.imageFileId',
      foreignField: '_id',
      as: 'file',
    };

    const unwindFile: PipelineStage.Unwind['$unwind'] = {
      path: '$file',
    };

    const projection: ProjectionFields<FriendDto> = {
      _id: 0,
      profileId: '$friends.profileId',
      hidden: '$friends.hidden',
      name: {
        $ifNull: ['$profile.name', '$friends.name'],
      },
      gender: '$profile.gender',
      username: '$user.username',
      profileImageKey: '$file.key',
    };

    const sort: PipelineStage.Sort['$sort'] = {
      name: 1,
    };

    const pipeline: PipelineStage[] = [
      { $match: filter },
      {
        $unwind: unwind,
      },
      { $match: match },
      { $lookup: lookupProfile },
      {
        $unwind: unwindProfile,
      },
      { $lookup: lookupUser },
      {
        $unwind: unwindUser,
      },
      { $lookup: lookupFile },
      {
        $unwind: unwindFile,
      },
      { $project: projection },
      { $sort: sort },
    ];

    if (paging) {
      pipeline.push(
        this.utilsService.getCommonMongooseFacet({
          page: params.page,
          limit: params.limit,
        }),
      );
      const cursor = await this.friendShipModel.aggregate(pipeline);
      const metdata = cursor[0].metadata;
      const data = cursor[0].data;
      return {
        total: metdata[0]?.total || 0,
        data: data,
      };
    } else {
      const doc = await this.friendShipModel.aggregate<FriendDto>(pipeline);

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

    dto.profileId = friend.profileId.toHexString();
    dto.profileId = friend.profileId.toHexString();
    return dto;
  }
}
