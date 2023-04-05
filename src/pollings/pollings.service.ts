import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  now,
  FilterQuery,
  Model,
  ProjectionFields,
  Types,
  PipelineStage,
} from 'mongoose';
import { PagingResDto } from 'src/common/dtos';
import { ProfilesService } from 'src/profiles/profiles.service';
import { Poll, PollDocument } from '../polls/schemas/poll.schema';
import { Round, RoundDocument } from '../polls/schemas/round.schema';
import { Polling, PollingDocument } from './schemas/polling.schema';
import { UserRound, UserRoundDocument } from './schemas/user-round.schema';
import { PollingDto, PollingResultDto } from './dtos/polling.dto';
import { UpdatePollingDto } from './dtos/update-polling.dto';
import {
  GetListPollingDto,
  GetListReceivePollingDto,
} from './dtos/get-polling.dto';
import { UseCoinDto } from '../coins/dtos/coin.dto';
import { CoinsService } from 'src/coins/conis.service';
import { FriendshipsService } from 'src/friendships/friendships.service';
import { UtilsService } from 'src/common/providers';
import { UserRoundDto, FindUserRoundDto } from './dtos/userround.dto';
import { WrappedError } from 'src/common/errors';
import { OPEN_POLLING } from 'src/coins/coins.constant';
import { UseType } from 'src/coins/enums';
import {
  POLLING_ERROR_MIN_FRIENDS,
  POLLING_MODULE_NAME,
  POLLING_ERROR_NOT_FOUND_POLLING,
  POLLING_ERROR_EXCEED_REFRESH,
  POLLING_ERROR_LACK_COIN_AMOUNT,
  POLLING_ERROR_ALREADY_DONE,
  POLLING_ERROR_EXCEED_SKIP,
  POLLING_ERROR_NOT_FOUND_POLL,
  POLLING_ERROR_NOT_FOUND_USERROUND,
} from './pollings.constant';
import { PollRoundEventDto } from 'src/polls/dtos/round-event.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PollingVotedEvent } from './events';
import { PollingStatsDto } from './dtos/pollingstatus.dto';
import { FeanutCardDto } from './dtos';

@Injectable()
export class PollingsService {
  constructor(
    @InjectModel(Polling.name) private pollingModel: Model<PollingDocument>,
    @InjectModel(UserRound.name)
    private userroundModel: Model<UserRoundDocument>,
    @InjectModel(Poll.name) private pollModel: Model<PollDocument>,
    @InjectModel(Round.name) private roundModel: Model<RoundDocument>,
    private profilesService: ProfilesService,
    private coinService: CoinsService,
    private friendShipsService: FriendshipsService,
    private utilsService: UtilsService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findFeanutCard(profileId: string): Promise<FeanutCardDto> {
    var myCard = new FeanutCardDto();
    myCard.joy = 0;
    myCard.gratitude = 0;
    myCard.serenity = 0;
    myCard.interest = 0;
    myCard.hope = 0;
    myCard.pride = 0;
    myCard.amusement = 0;
    myCard.inspiration = 0;
    myCard.awe = 0;
    myCard.love = 0;

    const filter: FilterQuery<PollingDocument> = {
      selectedProfileId: new Types.ObjectId(profileId),
    };

    const lookups: PipelineStage[] = [
      {
        $lookup: {
          from: 'polls',
          localField: 'pollId',
          foreignField: '_id',
          as: 'polls',
        },
      },
      {
        $unwind: {
          path: '$polls',
          preserveNullAndEmptyArrays: false,
        },
      },
    ];

    const projection = {
      emotion: '$polls.emotion',
      completedAt: 1,
    };

    const cursor = await this.pollingModel.aggregate([
      { $match: filter },
      ...lookups,
      { $project: projection },
    ]);

    if (cursor.length > 0) {
      cursor.forEach((element) => {
        if (Object.keys(myCard).includes(element.emotion)) {
          myCard[element.emotion] += 1;
        }
      });
    }

    return myCard;
  }

  async findPollingStats(profileId: string): Promise<PollingStatsDto> {
    const ownerId = await this.profilesService.getOwnerIdById(profileId);
    const pollsCount = await this.pollingModel
      .find({
        userId: ownerId,
      })
      .count();

    const pullsCount = await this.pollingModel
      .find({
        selectedProfileId: new Types.ObjectId(profileId),
      })
      .count();

    const status: PollingStatsDto = {
      pollsCount: pollsCount,
      pullsCount: pullsCount,
    };

    return status;
  }

  async existPollingByUserId(
    user_id,
    userround_id,
    poll_id: string,
  ): Promise<boolean> {
    const exist = await this.pollingModel.findOne({
      userId: new Types.ObjectId(user_id),
      userRoundId: new Types.ObjectId(userround_id),
      pollId: new Types.ObjectId(poll_id),
    });
    if (!exist) {
      return false;
    }

    return true;
  }

  async createPolling(user_id: string, body): Promise<Polling> {
    const PollExist = await this.pollModel.findById(body.pollId);

    if (!PollExist) {
      throw new WrappedError(
        POLLING_MODULE_NAME,
        POLLING_ERROR_NOT_FOUND_POLL,
      ).notFound();
    }

    // 친구목록 불러오기/셔플
    const friendList = await this.friendShipsService.listFriend(user_id);

    if (friendList.data.length < 4) {
      throw new WrappedError(
        POLLING_MODULE_NAME,
        POLLING_ERROR_MIN_FRIENDS,
        '활성화 된 친구를 4명 이상 추가해주세요.'
      ).reject();
    }

    const temp_arr = friendList.data
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);

    const friendIds = [];
    for (const friend of temp_arr) {
      friendIds.push(friend.profileId);
    }

    let polling = new Polling();
    polling = {
      userId: new Types.ObjectId(user_id),
      userRoundId: new Types.ObjectId(body.userRoundId),
      pollId: new Types.ObjectId(body.pollId),
      friendIds: [friendIds],
      isOpened: null,
    };

    const result = await new this.pollingModel(polling).save();

    await this.userroundModel.findByIdAndUpdate(result.userRoundId, {
      $push: { pollingIds: result._id },
    });

    const pollingId = result._id;
    const filter: FilterQuery<PollingDocument> = {
      _id: pollingId,
    };

    const lookups: PipelineStage[] = [
      {
        $unwind: {
          path: '$friendIds',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$friendIds',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'friendships',
          let: { friend_id: '$friendIds', user_id: '$userId' },
          pipeline: [
            {
              $unwind: '$friends',
            },
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$friends.profileId', '$$friend_id'] },
                    { $eq: ['$userId', '$$user_id'] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'profiles',
                localField: 'friends.profileId',
                foreignField: '_id',
                as: 'profile',
              },
            },
            {
              $unwind: {
                path: '$profile',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'files',
                localField: 'profile.imageFileId',
                foreignField: '_id',
                as: 'files',
              },
            },
            {
              $unwind: {
                path: '$files',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 0,
                userId: 0,
                createdAt: 0,
                updatedAt: 0,
                'profile._id': 0,
                'profile.__v': 0,
                'profile.phoneNumber': 0,
                'profile.ownerId': 0,
                'profile.createdAt': 0,
                'profile.updatedAt': 0,
                'files._id': 0,
                'files.__v': 0,
                'files.type': 0,
                'files.ownerId': 0,
                'files.createdAt': 0,
                'files.updatedAt': 0,
              },
            },
          ],
          as: 'friendIds',
        },
      },
      {
        $unwind: {
          path: '$friendIds',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'polls',
          localField: 'pollId',
          foreignField: '_id',
          as: 'pollId',
        },
      },
      {
        $unwind: {
          path: '$pollId',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          'pollId._id': 0,
          'pollId.isOpenedCount': 0,
          'pollId.createdAt': 0,
          'pollId.updatedAt': 0,
        },
      },
    ];

    const cursor = await this.pollingModel.aggregate([
      { $match: filter },
      ...lookups,
    ]);

    let mergedList = [];
    const cursors = cursor.slice(-4);
    for (const v of cursors) {
      let temp = { profileId: null, name: null, imageFileKey: null };
      temp.profileId = v.friendIds.friends.profileId;

      if (v.friendIds.profile.name) {
        temp.name = v.friendIds.profile.name;
      } else {
        temp.name = v.friendIds.friends.name;
      }

      if (v.friendIds.profile.imageFileId) {
        temp.imageFileKey = v.friendIds.files.key;
      }
      mergedList.push(temp);
    }

    cursor.at(-1).friendIds = mergedList;

    return cursor.at(-1);
  }

  async updateRefreshedPollingById(
    user_id,
    polling_id: string,
  ): Promise<Polling> {
    // polling 가져오기.
    const polling = await this.pollingModel.findById(polling_id);

    // 3번째 친구 새로고침인지 확인
    if (!polling.refreshCount) {
      polling.refreshCount = 1;
    } else {
      if (polling.refreshCount < 3) {
        polling.refreshCount += 1;
      } else {
        throw new WrappedError(
          POLLING_MODULE_NAME,
          POLLING_ERROR_EXCEED_REFRESH,
        ).reject();
      }
    }

    // 친구목록 불러오기/셔플
    let prevFriend = [];
    for (const arr of polling.friendIds) {
      prevFriend.push(arr);
    }

    let friendTempArr: any[] = []
    const friendList = await this.friendShipsService.listFriend(user_id);

    if (friendList.data.length < 4) {
      throw new WrappedError(
        POLLING_MODULE_NAME,
        POLLING_ERROR_MIN_FRIENDS,
        '활성화 된 친구를 4명 이상 추가해주세요.'
      ).reject();
    }

    // 친구 수 12명 이하이면 slice없이 셔플.(리프레쉬 횟수 3회 이므로.)
    if (friendList.data.length <= 12) {
    } else {
      friendTempArr = friendList.data
      .filter((friend) => !prevFriend.includes(friend.profileId))
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    }

    // polling friendlist 갱신
    const newIds = [];
    for (const friend of friendTempArr) {
      newIds.push(new Types.ObjectId(friend.profileId));
    }
    polling.friendIds.push(newIds);

    polling.save();

    const filter: FilterQuery<PollingDocument> = {
      _id: polling._id,
    };

    const lookups: PipelineStage[] = [
      {
        $unwind: {
          path: '$friendIds',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$friendIds',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'friendships',
          let: { friend_id: '$friendIds', user_id: '$userId' },
          pipeline: [
            {
              $unwind: '$friends',
            },
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$friends.profileId', '$$friend_id'] },
                    { $eq: ['$userId', '$$user_id'] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'profiles',
                localField: 'friends.profileId',
                foreignField: '_id',
                as: 'profile',
              },
            },
            {
              $unwind: {
                path: '$profile',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'files',
                localField: 'profile.imageFileId',
                foreignField: '_id',
                as: 'files',
              },
            },
            {
              $unwind: {
                path: '$files',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 0,
                userId: 0,
                createdAt: 0,
                updatedAt: 0,
                'profile._id': 0,
                'profile.__v': 0,
                'profile.phoneNumber': 0,
                'profile.ownerId': 0,
                'profile.createdAt': 0,
                'profile.updatedAt': 0,
                'files._id': 0,
                'files.__v': 0,
                'files.type': 0,
                'files.ownerId': 0,
                'files.createdAt': 0,
                'files.updatedAt': 0,
              },
            },
          ],
          as: 'friendIds',
        },
      },
      {
        $unwind: {
          path: '$friendIds',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'polls',
          localField: 'pollId',
          foreignField: '_id',
          as: 'pollId',
        },
      },
      {
        $unwind: {
          path: '$pollId',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          'pollId._id': 0,
          'pollId.isOpenedCount': 0,
          'pollId.createdAt': 0,
          'pollId.updatedAt': 0,
        },
      },
    ];

    const cursor = await this.pollingModel.aggregate([
      { $match: filter },
      ...lookups,
    ]);

    if (cursor.length < 4) {
      throw new WrappedError(
        POLLING_MODULE_NAME,
        POLLING_ERROR_NOT_FOUND_POLLING,
      ).notFound();
    }

    let mergedList = [];
    const cursors = cursor.slice(-4);
    for (const v of cursors) {
      let temp = { profileId: null, name: null, imageFileKey: null };
      temp.profileId = v.friendIds.friends.profileId;

      if (v.friendIds.profile.name) {
        temp.name = v.friendIds.profile.name;
      } else {
        temp.name = v.friendIds.friends.name;
      }

      if (v.friendIds.profile.imageFileId) {
        temp.imageFileKey = v.friendIds.files.key;
      }
      mergedList.push(temp);
    }

    cursor.at(-1).friendIds = mergedList;

    return cursor.at(-1);
  }

  async findListPolling(
    query: GetListPollingDto,
  ): Promise<PagingResDto<PollingDto>> {
    const filter: FilterQuery<PollingDocument> = {};

    const projection: ProjectionFields<PollingDto> = {
      _id: 1,
      userId: 1,
      roundId: 1,
      friendIds: 1,
      completedAt: 1,
      createdAt: 1,
    };

    const cursor = await this.pollingModel.aggregate([
      { $match: filter },
      { $project: projection },
      { $sort: { createdAt: -1 } },
      this.utilsService.getCommonMongooseFacet(query),
    ]);

    const metdata = cursor[0].metadata;
    const data = cursor[0].data;

    return {
      total: metdata[0]?.total || 0,
      data: data,
    };
  }

  async findListInboxByUserId(
    user_id: string,
    query: GetListReceivePollingDto,
  ): Promise<PagingResDto<PollingDto>> {
    const profile = await this.profilesService.getByUserId(user_id);

    const filter: FilterQuery<PollingDocument> = {
      selectedProfileId: profile._id,
    };

    const lookups: PipelineStage[] = [
      {
        $lookup: {
          from: 'profiles',
          localField: 'userId',
          foreignField: 'ownerId',
          as: 'profiles',
        },
      },
      {
        $unwind: {
          path: '$profiles',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'files',
          localField: 'profiles.imageFileId',
          foreignField: '_id',
          as: 'files',
        },
      },
      {
        $unwind: {
          path: '$files',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    const projection: ProjectionFields<PollingDto> = {
      _id: 1,
      userId: 1,
      pollId: 1,
      isOpened: 1,
      completedAt: 1,
      name: '$profiles.name',
      gender: '$profiles.gender',
      imageFileKey: '$files.key',
    };

    const cursor = await this.pollingModel.aggregate([
      { $match: filter },
      { $sort: { completedAt: -1 } },
      ...lookups,
      { $project: projection },
      this.utilsService.getCommonMongooseFacet(query),
    ]);

    const metdata = cursor[0].metadata;
    const data = cursor[0].data;

    data.forEach((element) => {
      if (!element.isOpened) {
        delete element.name;
        delete element.imageFileKey;
      }
    });

    return {
      total: metdata[0]?.total || 0,
      data: data,
    };
  }

  async existPollingById(polling_id: string) {
    const polling = await this.pollingModel.findById(polling_id);

    return polling;
  }

  async findPollingById(polling_id: string) {
    const filter: FilterQuery<PollingDocument> = {
      _id: new Types.ObjectId(polling_id),
    };

    const lookups: PipelineStage[] = [
      {
        $unwind: {
          path: '$friendIds',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$friendIds',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'friendships',
          let: { friend_id: '$friendIds', user_id: '$userId' },
          pipeline: [
            {
              $unwind: '$friends',
            },
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$friends.profileId', '$$friend_id'] },
                    { $eq: ['$userId', '$$user_id'] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'profiles',
                localField: 'friends.profileId',
                foreignField: '_id',
                as: 'profile',
              },
            },
            {
              $unwind: {
                path: '$profile',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'files',
                localField: 'profile.imageFileId',
                foreignField: '_id',
                as: 'files',
              },
            },
            {
              $unwind: {
                path: '$files',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 0,
                userId: 0,
                createdAt: 0,
                updatedAt: 0,
                'profile._id': 0,
                'profile.__v': 0,
                'profile.phoneNumber': 0,
                'profile.ownerId': 0,
                'profile.createdAt': 0,
                'profile.updatedAt': 0,
                'files._id': 0,
                'files.__v': 0,
                'files.type': 0,
                'files.ownerId': 0,
                'files.createdAt': 0,
                'files.updatedAt': 0,
              },
            },
          ],
          as: 'friendIds',
        },
      },
      {
        $unwind: {
          path: '$friendIds',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'polls',
          localField: 'pollId',
          foreignField: '_id',
          as: 'pollId',
        },
      },
      {
        $unwind: {
          path: '$pollId',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          'pollId._id': 0,
          'pollId.isOpenedCount': 0,
          'pollId.createdAt': 0,
          'pollId.updatedAt': 0,
        },
      },
    ];

    const cursor = await this.pollingModel.aggregate([
      { $match: filter },
      ...lookups,
    ]);

    if (cursor.length < 4) {
      throw new WrappedError(
        POLLING_MODULE_NAME,
        POLLING_ERROR_NOT_FOUND_POLLING,
      ).notFound();
    }

    let mergedList = [];
    const cursors = cursor.slice(-4);
    for (const v of cursors) {
      let temp = { profileId: null, name: null, imageFileKey: null };
      temp.profileId = v.friendIds.friends.profileId;

      if (v.friendIds.profile.name) {
        temp.name = v.friendIds.profile.name;
      } else {
        temp.name = v.friendIds.friends.name;
      }

      if (v.friendIds.profile.imageFileId) {
        temp.imageFileKey = v.friendIds.files.key;
      }
      mergedList.push(temp);
    }

    cursor.at(-1).friendIds = mergedList;

    return cursor.at(-1);
  }

  async findInboxPollingByUserId(user_id, polling_id: string) {
    const profile = await this.profilesService.getByUserId(user_id);
    const filter: FilterQuery<PollingDocument> = {
      _id: new Types.ObjectId(polling_id),
      selectedProfileId: profile._id,
    };

    const lookups: PipelineStage[] = [
      {
        $unwind: {
          path: '$friendIds',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$friendIds',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'friendships',
          let: { friend_id: '$friendIds', user_id: '$userId' },
          pipeline: [
            {
              $unwind: '$friends',
            },
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$friends.profileId', '$$friend_id'] },
                    { $eq: ['$userId', '$$user_id'] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'profiles',
                localField: 'friends.profileId',
                foreignField: '_id',
                as: 'profile',
              },
            },
            {
              $unwind: {
                path: '$profile',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'files',
                localField: 'profile.imageFileId',
                foreignField: '_id',
                as: 'files',
              },
            },
            {
              $unwind: {
                path: '$files',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 0,
                userId: 0,
                createdAt: 0,
                updatedAt: 0,
                'profile._id': 0,
                'profile.__v': 0,
                'profile.phoneNumber': 0,
                'profile.ownerId': 0,
                'profile.createdAt': 0,
                'profile.updatedAt': 0,
                'files._id': 0,
                'files.__v': 0,
                'files.type': 0,
                'files.ownerId': 0,
                'files.createdAt': 0,
                'files.updatedAt': 0,
              },
            },
          ],
          as: 'friendIds',
        },
      },
      {
        $unwind: {
          path: '$friendIds',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'polls',
          localField: 'pollId',
          foreignField: '_id',
          as: 'pollId',
        },
      },
      {
        $unwind: {
          path: '$pollId',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          'pollId._id': 0,
          'pollId.isOpenedCount': 0,
          'pollId.createdAt': 0,
          'pollId.updatedAt': 0,
        },
      },
      {
        $lookup: {
          from: 'profiles',
          localField: 'userId',
          foreignField: 'ownerId',
          as: 'voter',
        },
      },
      {
        $unwind: {
          path: '$voter',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          'voter.phoneNumber': 0,
          'voter.ownerId': 0,
          'voter.__v': 0,
          'voter.createdAt': 0,
          'voter.statusMessage': 0,
          'voter.updatedAt': 0,
        },
      },
      {
        $lookup: {
          from: 'files',
          localField: 'voter.imageFileId',
          foreignField: '_id',
          as: 'files',
        },
      },
      {
        $unwind: {
          path: '$files',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          'files._id': 0,
          'files.ownerId': 0,
          'files.type': 0,
          'files.__v': 0,
          'files.createdAt': 0,
          'files.updatedAt': 0,
        },
      },
      {
        $project: {
          userId: 0,
          skipped: 0,
          refreshCount: 0,
          useCoinId: 0,
          createdAt: 0,
          updatedAt: 0,
        },
      },
    ];

    const cursor = await this.pollingModel.aggregate([
      { $match: filter },
      ...lookups,
    ]);

    if (cursor.length < 4) {
      throw new WrappedError(
        POLLING_MODULE_NAME,
        POLLING_ERROR_NOT_FOUND_POLLING,
      ).notFound();
    }

    let mergedList = [];
    const cursors = cursor.slice(-4);

    for (const v of cursors) {
      let temp = { profileId: null, name: null, imageFileKey: null };
      temp.profileId = v.friendIds.friends.profileId;

      if (v.friendIds.profile.name) {
        temp.name = v.friendIds.profile.name;
      } else {
        temp.name = v.friendIds.friends.name;
      }

      if (v.friendIds.profile.imageFileId) {
        temp.imageFileKey = v.friendIds.files.key;
      }
      mergedList.push(temp);

      v.voter.imageFileKey = null;
      v.voter.profileId = v.voter._id;
      delete v.voter._id;
      if (!v.isOpened) {
        v.voter.name = null;
        delete v.voter.profileId;
      } else {
        if (v.voter.imageFileId) {
          v.voter.imageFileKey = v.files.key;
        }
      }
      delete v.voter.imageFileId;
      delete v.files;
    }

    cursor.at(-1).friendIds = mergedList;
    return cursor.at(-1);
  }

  async updatePolling(polling_id: string, body: UpdatePollingDto) {
    const result = await this.pollingModel.findByIdAndUpdate(polling_id, {
      $set: { body, updatedAt: now() },
    });
    return result._id.toString();
  }

  async updatePollingResult(
    user_id,
    polling_id: string,
    body,
  ): Promise<PollingResultDto> {
    let update: {
      selectedProfileId?: Types.ObjectId;
      skipped?: boolean;
      updatedAt: Date;
      completedAt: Date;
    } = {
      updatedAt: now(),
      completedAt: now(),
    };

    if (body.skipped) {
      let skipCount = await this.checkUserroundSkip(user_id, polling_id);
      if (skipCount >= 3) {
        throw new WrappedError(
          POLLING_MODULE_NAME,
          POLLING_ERROR_EXCEED_SKIP,
          '건너뛰기 횟수 3회 초과 입니다.',
        ).reject();
      }
      update.skipped = true;
    } else {
      update.selectedProfileId = new Types.ObjectId(body.selectedProfileId);
    }

    let polling = await this.pollingModel.findByIdAndUpdate(polling_id, {
      $set: update,
    });

    var res: PollingResultDto = {
      userroundCompleted: false,
      roundEvent: new PollRoundEventDto(),
    };
    const userround = await this.userroundModel.findById(polling.userRoundId);

    if (!userround) {
      throw new WrappedError(
        POLLING_MODULE_NAME,
        POLLING_ERROR_NOT_FOUND_USERROUND,
      ).reject();
    }

    let checked = await this.checkUserroundComplete(user_id, userround);
    res.userroundCompleted = checked;

    if (checked) {
      await this.updateComplete(user_id, userround._id);

      const round = await this.roundModel.aggregate([
        {
          $match: { _id: new Types.ObjectId(userround.roundId) },
        },
        {
          $lookup: {
            from: 'polls_round_events',
            localField: 'pollRoundEventId',
            foreignField: '_id',
            as: 'roundevent',
          },
        },
        {
          $unwind: {
            path: '$roundevent',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            'roundevent._id': 0,
            'roundevent.createdAt': 0,
            'roundevent.updatedAt': 0,
          },
        },
      ]);

      res.roundEvent = round[0].roundevent;

      // reward 지급
      if (round[0].roundevent != null) {
        const rewardAmount = round[0].roundevent.reward;
        await this.coinService.updateCoinAccum(user_id, rewardAmount);
      }
    }

    this.eventEmitter.emit(
      PollingVotedEvent.name,
      new PollingVotedEvent(
        polling._id,
        polling.pollId,
        update.selectedProfileId || null,
      ),
    );
    return res;
  }

  // 피넛을 소모. 수신투표 열기.
  async updatePollingOpen(user_id, polling_id: string): Promise<string> {
    //userId 사용하여 get profile
    const profile = await this.profilesService.getByUserId(user_id);

    // user_id의 feanut 개수 체크/차감
    const usercoin = await this.coinService.findUserCoin(user_id);

    if (usercoin.total < OPEN_POLLING) {
      throw new WrappedError(
        POLLING_MODULE_NAME,
        POLLING_ERROR_LACK_COIN_AMOUNT,
        'Lack of total feanut amount',
      ).reject();
    } else {
      const exist = await this.pollingModel.findOne({
        _id: new Types.ObjectId(polling_id),
        selectedProfileId: profile._id,
      });

      if (!exist) {
        throw new WrappedError(
          POLLING_MODULE_NAME,
          POLLING_ERROR_NOT_FOUND_POLLING,
        ).notFound();
      }
      if (exist.isOpened) {
        throw new WrappedError(
          POLLING_MODULE_NAME,
          POLLING_ERROR_ALREADY_DONE,
          'Already Opened',
        ).reject();
      }

      let usecoin: UseCoinDto = new UseCoinDto();
      usecoin = {
        userId: user_id,
        useType: UseType.Open,
        amount: OPEN_POLLING,
      };

      const usecoin_id = await this.coinService.createUseCoin(usecoin);
      if (usecoin_id) {
        const result = await this.pollingModel.findOneAndUpdate(
          {
            _id: exist._id,
            selectedProfileId: profile._id,
            isOpened: null,
          },
          {
            $set: { isOpened: true, useCoinId: usecoin_id, updatedAt: now() },
          },
        );

        if (result) {
        } else {
          await this.coinService.updateCoinAccum(user_id, OPEN_POLLING);
          throw new WrappedError(
            POLLING_MODULE_NAME,
            POLLING_ERROR_NOT_FOUND_POLLING,
          ).notFound();
        }

        // poll isOpenedCount 업데이트
        await this.pollModel.findByIdAndUpdate(result.pollId, {
          $inc: { isOpened: 1 },
        });

        return result._id.toString();
      }
    }
  }

  // userRound
  async createUserRound(user_id: string): Promise<UserRoundDto> {
    const userrounds = await this.userroundModel
      .find({
        userId: new Types.ObjectId(user_id),
      })
      .sort({ createdAt: -1 });

    const friendList = await this.friendShipsService.listFriend(user_id);
    if (friendList.data.length < 4) {
      throw new WrappedError(
        POLLING_MODULE_NAME,
        POLLING_ERROR_MIN_FRIENDS,
        null,
      ).reject();
    }
    const rounds = await this.roundModel.find().sort({ index: 1 });

    // 이벤트 라운드 체크
    var eventRounds = [];
    eventRounds = rounds.filter((element) => element.startedAt);

    eventRounds.sort((prev, next) => {
      if (prev.startedAt > next.startedAt) return -1;
      if (prev.startedAt < next.startedAt) return 1;
      return 0;
    });

    for (var i = 0; i < eventRounds.length; i++) {
      for (const ur of userrounds) {
        if (eventRounds[i]._id.toString() == ur.roundId) {
          eventRounds.splice(i, 1);
          i--;
          if (i < 0) {
            break;
          }
        }
      }
    }

    var normalRounds = [];
    normalRounds = rounds.filter((element) => !element.startedAt);

    var nextRound = new Round();
    if (eventRounds.length > 0) {
      nextRound = eventRounds[0];
      for (const v of eventRounds) {
        if (v.index == 0) {
          nextRound = v;
          break;
        }
      }
    } else {
      var currentRound = new Round();
      if (userrounds.length > 0) {
        for (let r of rounds) {
          if (r._id == userrounds[0].roundId) {
            currentRound = r;
          }
        }
        let filtered = normalRounds.filter(
          (element) => element.index > currentRound.index,
        );
        if (filtered.length > 0) {
          nextRound = filtered[0];
        } else {
          nextRound = normalRounds[0];
        }
      } else {
        nextRound = normalRounds[0];
      }
    }

    let shuffledPollIds = nextRound.pollIds.sort(() => Math.random() - 0.5);

    let userround = new UserRound();
    userround = {
      userId: new Types.ObjectId(user_id),
      roundId: nextRound._id,
      pollIds: shuffledPollIds,
      pollingIds: [],
    };

    const result = await new this.userroundModel(userround).save();

    return this.userRoundToDto(result);
  }

  async findUserRound(user_id: string): Promise<FindUserRoundDto> {
    var res = new FindUserRoundDto();

    const friendList = await this.friendShipsService.listFriend(user_id);
    if (friendList.data.length < 4) {
      throw new WrappedError(
        POLLING_MODULE_NAME,
        POLLING_ERROR_MIN_FRIENDS,
        null,
      ).reject();
    }

    const userrounds = await this.userroundModel.aggregate([
      {
        $match: { userId: new Types.ObjectId(user_id) },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: 4,
      },
      {
        $lookup: {
          from: 'pollings',
          localField: 'pollingIds',
          foreignField: '_id',
          as: 'pollingIds',
        },
      },
      {
        $project: {
          'pollingIds.userId': 0,
          'pollingIds.userRoundId': 0,
          'pollingIds.friendIds': 0,
          'pollingIds.selectedProfileId': 0,
          'pollingIds.skipped': 0,
          'pollingIds.isOpened': 0,
          'pollingIds.useCoinId': 0,
          'pollingIds.createdAt': 0,
          'pollingIds.updatedAt': 0,
        },
      },
    ]);

    if (userrounds.length > 0) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      userrounds[0].pollingIds.forEach((element) => {
        if (element.completedAt) {
          element.isVoted = true;
        } else {
          element.isVoted = false;
        }
        delete element.completedAt;
      });

      var todayRounds = [];
      userrounds.forEach((element) => {
        if (element.completedAt == null) {
          todayRounds.push(element);
        }
        if (element.completedAt >= start && element.completedAt <= end) {
          todayRounds.push(element);
        }
      });

      res.todayCount = todayRounds.length;

      if (res.todayCount == 0) {
        if (!userrounds[0].completedAt) {
          res.data = this.userRoundToDto(userrounds[0]);
        } else {
          const result = await this.createUserRound(user_id);
          res.data = result;
        }
      } else if (res.todayCount < 3) {
        let timecheck = 0;
        if (todayRounds[0].completedAt) {
          timecheck =
            todayRounds[0].completedAt.getTime() +
            1 * 60 * 1000 -
            now().getTime(); // 30분 30 * 60 * 1000

          res.remainTime = timecheck;
        }
        if (!userrounds[0].completedAt) {
          res.data = this.userRoundToDto(userrounds[0]);
        } else {
          if (timecheck < 0) {
            res.recentCompletedAt = userrounds[0].completedAt;
            const result = await this.createUserRound(user_id);
            res.data = result;
          } else {
            res.data = this.userRoundToDto(userrounds[0]);
          }
        }
      } else if (res.todayCount == 3) {
        let timecheck = 0;
        timecheck = end.getTime() - now().getTime();
        res.remainTime = timecheck;
        if (!userrounds[0].completedAt) {
          res.data = this.userRoundToDto(userrounds[0]);
        } else {
          if (timecheck < 0) {
          } else {
            res.recentCompletedAt = userrounds[0].completedAt;
            res.data = this.userRoundToDto(userrounds[0]);
          }
        }
      }
    } else {
      const result = await this.createUserRound(user_id);
      res.data = result;
      res.todayCount = 1;
    }

    return res;
  }

  async checkUserroundComplete(user_id: string, userround) {
    const pollings = await this.pollingModel.find({
      userRoundId: userround._id,
      userId: new Types.ObjectId(user_id),
      completedAt: { $ne: null },
    });

    // userround의 pollids길이 만큼 완료가 됐는지 확인
    if (pollings.length >= userround.pollIds.length) {
      return true;
    }

    return false;
  }

  async checkUserroundSkip(user_id, polling_id: string) {
    let polling = await this.pollingModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(polling_id),
          userId: new Types.ObjectId(user_id),
        },
      },
      {
        $lookup: {
          from: 'polling_user_rounds',
          localField: 'userRoundId',
          foreignField: '_id',
          as: 'userrounds',
        },
      },
      {
        $unwind: {
          path: '$userrounds',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'pollings',
          localField: 'userrounds.pollingIds',
          foreignField: '_id',
          as: 'pollings',
        },
      },
      {
        $project: {
          'pollings._id': 0,
          'pollings.userId': 0,
          'pollings.pollId': 0,
          'pollings.userRoundIds': 0,
          'pollings.friendIds': 0,
          'pollings.selectedProfileId': 0,
          'pollings.refreshCount': 0,
          'pollings.completedAt': 0,
          'pollings.isOpened': 0,
          'pollings.useCoinId': 0,
          'pollings.createdAt': 0,
          'pollings.updatedAt': 0,
        },
      },
    ]);
    let count = 0;
    if (polling.length > 0) {
      polling[0].pollings.forEach((element) => {
        if (element.skipped == true) {
          count += 1;
        }
      });
    }
    return count;
  }

  async updateComplete(
    user_id: string,
    userround_id: Types.ObjectId,
  ): Promise<string> {
    const result = await this.userroundModel.findOneAndUpdate(
      {
        _id: userround_id,
        userId: new Types.ObjectId(user_id),
      },
      {
        $set: { complete: true, completedAt: now() },
      },
    );

    return result._id.toString();
  }

  async findUserRoundById(user_id: string, body) {
    const res = await this.userroundModel.findOne({
      _id: new Types.ObjectId(body.userRoundId),
      userId: new Types.ObjectId(user_id),
    });

    return res;
  }

  pollingToDto(doc: Polling | PollingDocument): PollingDto {
    const dto = new PollingDto();
    dto.id = doc._id.toHexString();
    dto.userId = doc.userId;
    dto.userRoundId = doc.userRoundId;
    dto.pollId = doc.pollId;
    dto.friendIds = doc.friendIds;
    if (doc.completedAt) {
      dto.isVoted = true;
    } else {
      dto.isVoted = false;
    }
    return dto;
  }

  userRoundToDto(doc: UserRound | UserRoundDocument): UserRoundDto {
    const dto = new UserRoundDto();
    dto.id = doc._id.toHexString();
    dto.userId = doc.userId.toHexString();
    dto.roundId = doc.roundId.toHexString();
    dto.pollIds = doc.pollIds;
    dto.pollingIds = doc.pollingIds;
    dto.complete = doc.complete;
    return dto;
  }
}
