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
import {
  UserRound,
  UserRoundDocument,
} from 'src/pollings/schemas/user-round.schema';
import { AddFriendDto, AddFriendManyDto, FriendDto } from './dtos';
import { ProfilesService } from 'src/profiles/profiles.service';
import { WrappedError } from 'src/common/errors';
import { FRIENDSHIPS_MODULE_NAME } from './friendships.constant';
import { UtilsService } from 'src/common/providers';
import { PagingResDto } from 'src/common/dtos';
import { PROFILE_SCHEMA_NAME } from 'src/profiles/profiles.constant';
import { USER_SCHEMA_NAME } from 'src/users/users.constant';
import { FILE_SCHEMA_NAME } from 'src/files/files.constant';
import { ListFriendParams } from './interfaces';
import { UsersService } from 'src/users/users.service';
import * as dayjs from 'dayjs';

@Injectable()
export class FriendshipsService {
  constructor(
    @InjectModel(Friendship.name)
    private friendShipModel: Model<FriendShipDocument>,
    @InjectModel(UserRound.name)
    private userroundModel: Model<UserRoundDocument>,
    private profilesService: ProfilesService,
    private utilsService: UtilsService,
    private usersService: UsersService,
  ) {}

  /** 친구추가 방법 변경 for Legacy */
  // 친구목록 legacy 사용자 초기화
  async clearFriendsForLegacy(userId: string | Types.ObjectId) {
    const friendship = await this.friendShipModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    // 1. 친구 목록 초기화
    friendship.isLegacy = undefined;
    friendship.friends = [];

    // 2. POLLING 후처리
    await this.userroundModel.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        completedAt: null,
      },
      {
        completedAt: dayjs().subtract(2, 'day').toDate(),
        complete: true,
      },
      {
        $sort: { createdAt: -1 },
      },
    );

    // 3. save cleared legacy
    await friendship.save();
  }
  // 연락처 강제 동기화로 친구추가한 friendship 조회
  async isLegacyFriendShipByUserId(
    userId: string | Types.ObjectId,
  ): Promise<boolean> {
    const friendship = await this.friendShipModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (friendship?.isLegacy) {
      return true;
    }

    return false;
  }
  /** --- */

  async addFriendByProfileId(userId: string, profileId: string) {
    // 이미 추가된 친구인지 검증
    if (await this.hasFriend(userId, profileId)) {
      throw new WrappedError(
        FRIENDSHIPS_MODULE_NAME,
        null,
        'already added friend ',
      ).alreadyExist();
    }

    await this.addFriendToList(userId, profileId, '');
  }

  async getFriendByProfileId(
    userId: string,
    profileId: string,
  ): Promise<Friend | null> {
    const friends = await this.friendShipModel.aggregate([
      {
        $match: {
          userId: { $eq: new Types.ObjectId(userId) },
        },
      },
      { $unwind: '$friends' },
      {
        $match: {
          'friends.profileId': { $eq: new Types.ObjectId(profileId) },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$friends.name',
          profileId: '$friends.profileId',
        },
      },
    ]);

    const friend = friends[0];
    if (friend) {
      return friend;
    }

    return null;
  }

  // 전화번호부 동기화
  async addFriendManyWithCheck(userId: string, dto: AddFriendManyDto) {
    // 유효하지않은 전화번호부 로깅
    const user = await this.usersService.findActiveUserById(userId);

    const friendship = await this.friendShipModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    // 내 전화번호 필터링
    dto.contacts = dto.contacts.filter(
      (x) => x.phoneNumber !== user.phoneNumber,
    );

    // 이미 가입된 프로필 조회
    const profiles = await this.profilesService.activeListByPhoneNumbers(
      dto.contacts.map((x) => x.phoneNumber),
    );

    const existsCreateList: {
      [phoneNumber: string]: { name: string; profileId: Types.ObjectId };
    } = {};
    const needToCreateList: { [phoneNumber: string]: string } = {};

    dto.contacts.forEach((contact) => {
      const profile = profiles.find(
        (x) => x.phoneNumber === contact.phoneNumber,
      );
      if (profile) {
        existsCreateList[contact.phoneNumber] = {
          name: contact.name,
          profileId: profile._id,
        };
      } else {
        needToCreateList[contact.phoneNumber] = contact.name;
      }
    });

    // 가입되지 않은 전화번호 프로필 등록
    const createdProfiles =
      await this.profilesService.createManyWithPhoneNumbers(
        // key is phoneNumber
        Object.keys(needToCreateList),
      );

    // 친구 등록
    createdProfiles.forEach((profile) => {
      friendship.friends.push({
        profileId: profile._id,
        name: needToCreateList[profile.phoneNumber],
      });
    });

    // 이미 가입된 친구
    Object.keys(existsCreateList).map((key) => {
      const existProfile = existsCreateList[key];

      const index = friendship.friends.findIndex((x) =>
        x.profileId.equals(existProfile.profileId),
      );

      if (index >= 0) {
        // 이미 친구라면 이름 최신화
        friendship.friends[index].name = existProfile.name;
      } else {
        // 친구아니면 등록
        friendship.friends.push({
          profileId: existProfile.profileId,
          name: existProfile.name,
        });
      }
    });

    await friendship.save();
  }

  // 활성화된 친구수
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
      // 내 전화번호 검증 필요
      const user = await this.usersService.findActiveUserById(userId);
      if (user.phoneNumber === dto.phoneNumber) {
        throw new WrappedError(
          FRIENDSHIPS_MODULE_NAME,
          null,
          'failed to add my phone number',
        ).alreadyExist();
      }

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

  // 인자 ID가 속한 모든 친구관계에서 삭제
  async removeFriendsAllByProfileId(profileId: string | Types.ObjectId) {
    profileId = new Types.ObjectId(profileId);
    await this.friendShipModel.updateMany(
      {
        'friends.profileId': profileId,
      },
      {
        $pull: {
          friends: { profileId },
        },
      },
    );
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
      preserveNullAndEmptyArrays: true,
    };

    const lookupUser: PipelineStage.Lookup['$lookup'] = {
      from: USER_SCHEMA_NAME,
      localField: 'profile.ownerId',
      foreignField: '_id',
      as: 'user',
    };

    const unwindUser: PipelineStage.Unwind['$unwind'] = {
      path: '$user',
      preserveNullAndEmptyArrays: true,
    };

    const addNameFields: PipelineStage.AddFields['$addFields'] = {
      name: {
        $cond: [
          // 회원가입 안했으면
          {
            $eq: [{ $ifNull: ['$user._id', null] }, null],
          },
          // 내 친구목록 이름으로 조회
          '$friends.name',
          '$profile.name',
        ],
      },
    };

    const matchUser: FilterQuery<FriendDto> = {
      name: { $regex: params.keyword, $options: 'i' },
    };

    const lookupFile: PipelineStage.Lookup['$lookup'] = {
      from: FILE_SCHEMA_NAME,
      localField: 'profile.imageFileId',
      foreignField: '_id',
      as: 'file',
    };

    const unwindFile: PipelineStage.Unwind['$unwind'] = {
      path: '$file',
      preserveNullAndEmptyArrays: true,
    };

    const projection: ProjectionFields<FriendDto> = {
      _id: 0,
      profileId: '$friends.profileId',
      user: 1,
      hidden: '$friends.hidden',
      name: 1,
      gender: '$profile.gender',
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
      { $addFields: addNameFields },
      params.keyword && { $match: matchUser },
      { $lookup: lookupFile },
      {
        $unwind: unwindFile,
      },
      { $project: projection },
      { $sort: sort },
    ].filter((x) => x);

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
}
