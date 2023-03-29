import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { now, FilterQuery, Model, ProjectionFields, Types, PipelineStage } from 'mongoose';
import { PagingResDto } from 'src/common/dtos';
import { ProfilesService } from 'src/profiles/profiles.service';
import { Poll, PollDocument } from '../polls/schemas/poll.schema';
import { Round, RoundDocument } from '../polls/schemas/round.schema';
import { Polling, PollingDocument } from './schemas/polling.schema';
import { UserRound, UserRoundDocument } from './schemas/userround.schema';
import { PollingDto, PollingResultDto, ReceivePollingDto } from './dtos/polling.dto';
import { UpdatePollingDto } from './dtos/update-polling.dto';
import {
  GetListPollingDto,
  GetListReceivePollingDto,
} from './dtos/get-polling.dto';
import { UseCoinDto } from '../coins/dtos/coin.dto';
import { UsersService } from 'src/users/users.service';
import { CoinsService } from 'src/coins/conis.service';
import { FriendshipsService } from 'src/friendships/friendships.service';
import { UtilsService } from 'src/common/providers';
import { UserRoundDto, FindUserRoundDto } from './dtos/userround.dto';
import { WrappedError } from 'src/common/errors';
import { OPEN_POLLING } from 'src/coins/coins.constant';
import { UseType } from 'src/coins/enums';

@Injectable()
export class PollingsService {
  constructor(
    @InjectModel(Polling.name) private pollingModel: Model<PollingDocument>,
    @InjectModel(UserRound.name)
    private userroundModel: Model<UserRoundDocument>,
    @InjectModel(Poll.name) private pollModel: Model<PollDocument>,
    @InjectModel(Round.name) private roundModel: Model<RoundDocument>,
    private profilesService: ProfilesService,
    private userService: UsersService,
    private coinService: CoinsService,
    private friendShipsService: FriendshipsService,
    private utilsService: UtilsService,
  ) {}

  async createPolling(
    user_id: string,
    body): Promise<Polling> {
    // 친구목록 불러오기/셔플
    const friendList = await this.friendShipsService.listFriend(user_id);
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
      userroundId: new Types.ObjectId(body.userRoundId),
      pollId: new Types.ObjectId(body.pollId),
      friendIds: [friendIds],
      isOpened: null,
      createdAt: now(),
    };

    const result = await new this.pollingModel(polling).save();
  
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
        $lookup: {
          from: 'profiles',
          localField: 'friendIds',
          foreignField: '_id',
          as: 'friendIds',
        },
      },
    ];

    const cursor = await this.pollingModel.aggregate([
      { $match: filter },
      ...lookups,
    ]);

    cursor[cursor.length-1].friendIds.forEach(element => {
      delete element.birth;
      delete element.phoneNumber;
      delete element.ownerId;
      delete element.createdAt;
      delete element.updatedAt;
      delete element.statusMessage;
    });

    return cursor[cursor.length-1];
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
        throw new WrappedError('Exceed your free refresh count').reject()
      }
    }
    
    // 친구목록 불러오기/셔플
    let prevFriend = []
    for (const arr of polling.friendIds) {
      prevFriend.push(arr);
    }

    const friendList = await this.friendShipsService.listFriend(user_id);
    const temp_arr = friendList.data
      .filter(friend => !prevFriend.includes(friend.profileId))
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);

    // polling friendlist 갱신
    const newIds = [];
    for (const friend of temp_arr) {
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
        $lookup: {
          from: 'profiles',
          localField: 'friendIds',
          foreignField: '_id',
          as: 'friendIds',
        },
      },
    ];

    const cursor = await this.pollingModel.aggregate([
      { $match: filter },
      ...lookups,
    ]);

    cursor[cursor.length-1].friendIds.forEach(element => {
      delete element.birth;
      delete element.phoneNumber;
      delete element.ownerId;
      delete element.createdAt;
      delete element.updatedAt;
      delete element.statusMessage;
    });

    return polling;
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
      selectedAt: 1,
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
    ];

    const projection: ProjectionFields<PollingDto> = {
      _id: 1,
      userId: 1,
      pollId: 1,
      isOpened: 1,
      name: '$profiles.name',
      imageFileId: '$profiles.imageFileId'
    };

    const cursor = await this.pollingModel.aggregate([
      { $match: filter },
      { $sort: {selectedAt: -1}},
      ...lookups,
      { $project: projection },
      this.utilsService.getCommonMongooseFacet(query),
    ]);

    const metdata = cursor[0].metadata;
    const data = cursor[0].data;

    data.forEach(element => {
      if (!element.isOpened) {
        delete element.name;
        delete element.imageFilePath;  
      }
    });

    return {
      total: metdata[0]?.total || 0,
      data: data,
    };
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
        $lookup: {
          from: 'profiles',
          localField: 'friendIds',
          foreignField: '_id',
          as: 'friendIds',
        },
      },
    ];

    const projection: ProjectionFields<PollingDto> = {
      _id: 1,
      userId: 1,
      pollId: 1,
      friendIds: 1,
      selectedAt: 1,
    };

    const cursor = await this.pollingModel.aggregate([
      { $match: filter },
      ...lookups,
      { $project: projection }
    ]);

    if (cursor.length == 0) {
      throw new WrappedError('Not found polling').notFound();
    }
    cursor[cursor.length-1].friendIds.forEach(element => {
      delete element.birth;
      delete element.gender;
      delete element.phoneNumber;
      delete element.ownerId;
      delete element.createdAt;
      delete element.updatedAt;
      delete element.statusMessage;
    });

    return cursor[cursor.length-1];
  }

  async findInboxPollingByUserId(user_id, polling_id: string) {
    const profile = await this.profilesService.getByUserId(user_id);

    const filter: FilterQuery<PollingDocument> = {
      _id: new Types.ObjectId(polling_id),
      selectedProfileId: profile._id,
      isOpened: true,
    };

    const lookups: PipelineStage[] = [
      {
        $unwind: {
          path: '$friendIds',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'profiles',
          localField: 'friendIds',
          foreignField: '_id',
          as: 'friendIds',
        },
      },
      {
        $lookup: {
          from: 'profiles',
          localField: 'userId',
          foreignField: 'ownerId',
          as: 'user',
        },
      },
      {
        $unwind: {        
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    const projection: ProjectionFields<ReceivePollingDto> = {
      _id: 1,
      userId: 1,
      userName: '$user.name',
      userImageFileId: '$user.imageFileId',
      friendIds: 1,
      selectedAt: 1,
      selectedProfileId: 1,
    };

    const cursor = await this.pollingModel.aggregate([
      { $match: filter },
      ...lookups,
      { $project: projection }
    ]);

    if (cursor.length == 0) {
      throw new WrappedError('Not Found Receive Polling').notFound();
    }

    cursor[cursor.length-1].friendIds.forEach(element => {
      delete element.birth;
      delete element.gender;
      delete element.phoneNumber;
      delete element.ownerId;
      delete element.createdAt;
      delete element.updatedAt;
      delete element.statusMessage;
      delete element.instagram
    });

    return cursor[cursor.length-1];
  }

  async updatePolling(polling_id: string, body: UpdatePollingDto) {
    const result = await this.pollingModel.findByIdAndUpdate(polling_id, {
      $set: { body, updatedAt: now() },
    });
    return result._id.toString();
  }

  async updatePollingResult(user_id, polling_id: string, body): Promise<PollingResultDto> {
    var res = new PollingResultDto()
    
    var result = ''
    if (body.skipped){
      let polling = await this.pollingModel.findByIdAndUpdate(polling_id, {
        $set: {
          skipped: body.skipped,
          updatedAt: now(),
          selectedAt: now(),
        },
      });
      result = polling._id.toString();
    } else {
      let polling = await this.pollingModel.findByIdAndUpdate(polling_id, {
        $set: {
          selectedProfileId: new Types.ObjectId(body.selectedProfileId),
          updatedAt: now(),
          selectedAt: now(),
        },
      });
      result = polling._id.toString();
    }

    const userround = await this.userroundModel
      .findOne({
        userId: user_id,
      })
      .sort({ createdAt: -1 });

    const checked = await this.checkUserroundComplete(user_id, userround);
    
    if (checked) {
      const complete = await this.updateComplete(user_id, userround._id.toString());
      // pollround event 로 수정예정
      // res.roundReward = ROUND_REWARD;
      res.roundReward = 2;
    }

    res.userroundCompleted = checked;

    return res;
  }

  // 피넛을 소모. 수신투표 열기.
  async updatePollingOpen(user_id, polling_id: string): Promise<string> {
    //userId 사용하여 get profile
    const profile = await this.profilesService.getByUserId(user_id);

    // user_id의 feanut 개수 체크/차감
    const usercoin = await this.coinService.findUserCoin(user_id);

    if (usercoin.total < OPEN_POLLING) {
      throw new WrappedError('Lack of total feanut amount').reject()
    } else {
      const exist = await this.pollingModel.findOne({
        _id: new Types.ObjectId(polling_id),
        selectedProfileId: profile._id,        
      });

      if (!exist) {
        throw new WrappedError('Not found polling').notFound();
      }
      if (exist.isOpened) {
        throw new WrappedError('already Opened').reject();
      }

      let usecoin: UseCoinDto = new UseCoinDto();
      usecoin = {
        userId: user_id,
        useType: UseType.Open,
        amount: OPEN_POLLING,
      };

      const usecoin_id = await this.coinService.createUseCoin(usecoin);
      await this.coinService.updateCoinAccum(user_id, -1 * 3);

      const result = await this.pollingModel.findOneAndUpdate(
        {
          _id: new Types.ObjectId(polling_id),
          selectedProfileId: profile._id,
          isOpened: false,
        },
        {
          $set: { isOpened: true, useCoinId: usecoin_id, updatedAt: now() },
        },
      );
  
      // poll isOpenedCount 업데이트
      await this.pollModel.findByIdAndUpdate(result.pollId, {
        $inc: { isOpened: 1 },
      });
  
      return result._id.toString();
    }
  }

  // userRound
  async createUserRound(user_id: string, userrounds): Promise<UserRoundDto> {
    const friendList = await this.friendShipsService.listFriend(user_id);
    if (friendList.total < 4) {
      throw new WrappedError('Please add friends at least four.').reject()
    }

    const rounds = await this.roundModel.find();

    // 이벤트 라운드 체크
    var eventRounds = []
    eventRounds = rounds.filter((element) => (element.pollRoundEventId));

    eventRounds.sort((prev, next) => {
      if(prev.startedAt > next.startedAt) return 1;
      if(prev.startedAt < next.startedAt) return -1;
      return 0;
    })

    for (var i = 0; i < eventRounds.length; i++) {
      for (const ur of userrounds) {
        if (eventRounds[i]._id.toString() == ur.roundId) {
          eventRounds.splice(i, 1);
          i--;
        }
      }
    }

    var normalRounds = []
    normalRounds = rounds.filter((element) => !(element.pollRoundEventId));
    normalRounds.sort((prev, next) => {
      if(prev.index > next.index) return 1;
      if(prev.index < next.index) return -1;
      return 0;
    })

    var nextRound = new Round();
    if (eventRounds) {
      nextRound = eventRounds[0];
    } else {
      if (userrounds) {
        for (let i = 0; i < normalRounds.length; i++) {
          if (normalRounds[i].index == userrounds[0].index) {
            if ((i + 1) < normalRounds.length) {
              nextRound = normalRounds[i+1];
            } else{
              nextRound = normalRounds[0];
            }
            break;
          }
        }
      } else {
        nextRound = normalRounds[0];
      }
    }

    let shuffledPollIds = nextRound.pollIds
      .sort(() => Math.random() - 0.5)
      .slice(0, 17);
    let userround = new UserRound();
    userround = {
      userId: user_id,
      roundId: nextRound._id.toString(),
      pollIds: shuffledPollIds,
      createdAt: now(),
    };
    const result = await new this.userroundModel(userround).save();
    return result;
  }

  async findRecentUserRound(user_id: string) {
    const recent = await this.userroundModel
      .findOne({
        userId: user_id,
      })
      .sort({ createdAt: -1 });

    return recent;
  }

  async findUserRound(user_id: string): Promise<FindUserRoundDto> {
    var res = new FindUserRoundDto()

    var sortStart = new Date(now().getTime() - 365 * 24 * 3600000)

    const userrounds = await this.userroundModel
      .find({
        userId: user_id,
        createdAt: { $gte: sortStart },
      })
      .sort({ createdAt: -1 });

    if (userrounds.length > 0) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
  
      var todayRounds = []
      userrounds.forEach(element => {
        if (element.completedAt == null) {
          todayRounds.push(element);
        }
        if ((element.completedAt >= start) && (element.completedAt <= end)) {
          todayRounds.push(element);
        }
      });
  
      res.todayCount = todayRounds.length;
  
      if (res.todayCount == 0) {
        if (!userrounds[0].completedAt) {
          res.data = userrounds[0];
        } else {
          const result = await this.createUserRound(user_id, userrounds)
          res.data = result;
        }
      } else if (res.todayCount == (1 || 2)) {
        if (todayRounds[0].completedAt) {
          res.remainTime = todayRounds[0].completedAt.getTime() + (30 * 60 * 1000) - now().getTime();
        }
        if (!userrounds[0].completedAt) {
          res.data = userrounds[0];
        } else {
          res.recentCompletedAt = userrounds[0].completedAt;
          const result = await this.createUserRound(user_id, userrounds)
          res.data = result;
        }
      } else if (res.todayCount == 3 ) {
        res.remainTime = end.getTime() - now().getTime();
        if (!userrounds[0].completedAt) {
          res.data = userrounds[0];
        } else {
          res.recentCompletedAt = userrounds[0].completedAt;
        }
      }
    } else {
      const result = await this.createUserRound(user_id, userrounds)
      res.data = result;
      res.todayCount = 0;
    }

    return res;
  }

  async checkUserroundComplete(user_id: string, userround) {
    const pollings = await this.pollingModel.find({
      userroundId: userround._id,
      selectedAt: { $ne: null }
    });

    // userround의 pollids길이 만큼 완료가 됐는지 확인
    if (pollings.length >= userround.pollIds.length) {
      return true
    }

    return false
  }

  async updateComplete(user_id, userround_id: string): Promise<string> {
    const result = await this.userroundModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(userround_id),
        userId: user_id,
      },
      {
        $set: { complete: true, completedAt: now() },
      },
    );

    // 투표 완료: 코인 획득
    // pollround event 로 수정예정
    // await this.coinService.updateCoinAccum(user_id, ROUND_REWARD);
    await this.coinService.updateCoinAccum(user_id, 2);

    return result._id.toString();
  }

  async findUserRoundById(user_id: string, body) {
    const res = await this.userroundModel.findOne({
      _id: new Types.ObjectId(body.userRoundId),
      userId: user_id,
    });

    return res
  }

  pollingToDto(doc: Polling | PollingDocument): PollingDto {
    const dto = new PollingDto();
    dto.id = doc._id.toHexString();
    dto.userId = doc.userId;
    dto.userroundId = doc.userroundId;
    dto.pollId = doc.pollId;
    dto.friendIds = doc.friendIds;
    dto.createdAt = doc.createdAt;
    return dto;
  }

  userRoundToDto(doc: UserRound | UserRoundDocument): UserRoundDto {
    const dto = new UserRoundDto();
    dto.id = doc._id.toHexString();
    dto.userId = doc.userId;
    dto.roundId = doc.roundId;
    dto.pollIds = doc.pollIds;
    return dto;
  }
}