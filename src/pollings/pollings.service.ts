import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { now, FilterQuery, Model, ProjectionFields, Types } from 'mongoose';
import { PagingResDto } from 'src/common/dtos';
import { ProfilesService } from 'src/profiles/profiles.service';
import { Poll, PollDocument } from '../polls/schemas/poll.schema';
import { Round, RoundDocument } from '../polls/schemas/round.schema';
import { Polling, PollingDocument } from './schemas/polling.schema';
import { UserRound, UserRoundDocument } from './schemas/userround.schema';
import { PollingDto, PollingOpenDto, Opened, PollingResultDto } from './dtos/polling.dto';
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
import { OPEN_POLLING, ROUND_REWARD } from 'src/coins/coins.constant';

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
    const krtime = new Date(now().getTime() + 9 * 60 * 60 * 1000);

    let isopened = new Opened();
    isopened = { isOpened: false, useCoinId: null };

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
      userId: user_id,
      userroundId: body.userRoundId,
      pollId: body.pollId,
      friendIds: friendIds,
      opened: isopened,
      createdAt: krtime,
    };

    const result = await new this.pollingModel(polling).save();

    return result;
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
    const friendList = await this.friendShipsService.listFriend(user_id);
    const temp_arr = friendList.data
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    // polling friendlist 갱신
    const newIds = [];
    for (const friend of temp_arr) {
      newIds.push(friend.profileId);
    }
    polling.friendIds = newIds;

    polling.save();

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

  async findListPollingByUserId(
    user_id: string,
    query: GetListReceivePollingDto,
  ): Promise<PagingResDto<PollingDto>> {
    const profile = await this.profilesService.getByUserId(user_id);

    const filter: FilterQuery<PollingDocument> = {
      selectedProfileId: profile._id,
    };

    const projection: ProjectionFields<PollingDto> = {
      _id: 1,
      userId: 1,
      roundId: 1,
      pollIds: 1,
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

  async findPollingById(polling_id: string) {
    const result = await this.pollingModel.findById(polling_id);
    return result;
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
      const [complete, coinAmount] = await this.updateComplete(user_id, userround._id.toString());
      res.roundReward = ROUND_REWARD;
      res.totalFeanut = coinAmount;
    }

    res.pollingId = result;
    res.userroundId = userround._id.toString();
    res.userroundCompleted = checked;

    return res;
  }

  // 피넛을 소모. 수신투표 열기.
  async updatePollingOpen(user_id, polling_id: string, body: PollingOpenDto): Promise<string> {
    let opened = new Opened();

    //userId 사용하여 get profile
    const profile = await this.profilesService.getByUserId(user_id);

    // user_id의 feanut 개수 체크/차감
    const usercoin = await this.coinService.findUserCoin(user_id);

    if (usercoin.total < OPEN_POLLING) {
      throw new WrappedError('Lack of total feanut amount').reject()
    } else {
      let usecoin: UseCoinDto = new UseCoinDto();
      usecoin = {
        userId: user_id,
        useType: body.useType,
        amount: OPEN_POLLING,
      };

      const usecoin_result = await this.coinService.createUseCoin(usecoin);
      await this.coinService.updateCoinAccum(user_id, -1 * 3);

      // polling isOpened 상태 업데이트
      opened = {
        isOpened: true,
        useCoinId: usecoin_result,
      };
    }

    const result = await this.pollingModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(polling_id),
        selectedProfileId: profile._id,
      },
      {
        $set: { opened: opened, updatedAt: now() },
      },
    );

    // poll isOpenedCount 업데이트
    await this.pollModel.findByIdAndUpdate(result.pollId, {
      $inc: { isOpened: 1 },
    });

    return result._id.toString();
  }

  // userRound
  async createUserRound(user_id: string, userrounds): Promise<UserRoundDto> {
    const rounds = await this.roundModel.find();

    // 이벤트 라운드 체크
    var eventRounds = []
    eventRounds = rounds.filter((element) => element.eventRound == true);

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
    normalRounds = rounds.filter((element) => element.eventRound == false);
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

  async updateComplete(user_id, userround_id: string): Promise<[string, number]> {
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
    const coin = await this.coinService.updateCoinAccum(user_id, ROUND_REWARD);

    return [result._id.toString(), coin.total];
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