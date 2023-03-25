import { Injectable, Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  now,
  FilterQuery,
  Model,
  PipelineStage,
  ProjectionFields,
  Types,
} from 'mongoose';
import { PagingResDto } from 'src/common/dtos';
import { ProfilesService } from 'src/profiles/profiles.service';
import { Poll, PollDocument } from '../polls/schemas/poll.schema';
import { Round, RoundDocument } from '../polls/schemas/round.schema';
import { Polling, PollingDocument } from './schemas/polling.schema';
import { UserRound, UserRoundDocument } from './schemas/userround.schema';
import {
  PollingDto,
  PollingOpenDto,
  Opened,
} from './dtos/polling.dto';
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
import { UseType } from 'src/coins/enums/usetype.enum';
import { UserRoundDto } from './dtos/userround.dto';
import { KR_TIME_DIFF } from 'src/common/common.constant';

@Injectable()
export class PollingsService {
  constructor(
    @InjectModel(Polling.name) private pollingModel: Model<PollingDocument>,
    @InjectModel(UserRound.name) private userroundModel: Model<UserRoundDocument>,
    @InjectModel(Poll.name) private pollModel: Model<PollDocument>,
    @InjectModel(Round.name) private roundModel: Model<RoundDocument>,
    private profilesService: ProfilesService,
    private userService: UsersService,
    private coinService: CoinsService,
    private friendShipsService: FriendshipsService,
    private utilsService: UtilsService,
  ) {}

  async createPolling(user_id: string, userround) {
    const krtime = new Date(now().getTime() + (9 * 60 * 60 * 1000))

    var isopened = new Opened();
    isopened = { isOpened: false, useCoinId: null}

    // userround의 pollIds에 추가 되지 않은 pollId sorting
    const round = await this.roundModel.findById(userround.roundId);
    
    var newPollId: string = ''
    for (var i=0; i < round.pollIds.length; i++) {
      if (userround.pollIds.includes(round.pollIds[i])) {
      } else {
        newPollId = round.pollIds[i];
        break;
      }
    }

    // 친구목록 불러오기/셔플
    const friendList = await this.friendShipsService.listFriend(user_id);
    const temp_arr = friendList.data.sort(() => Math.random() - 0.5).slice(0, 4);

    var friendIds = [];
    for (const friend of temp_arr) {
      friendIds.push(friend.profileId);
    }

    var polling = new Polling();
    polling = {
      userId: user_id,
      roundId: userround.roundId,
      pollId: newPollId,
      friendIds: friendIds,
      opened: isopened,
      createdAt: krtime,
    }

    const result = await new this.pollingModel(polling).save();

    // userround에 pollId추가
    await this.userroundModel.findByIdAndUpdate(userround._id, {
      $set: {
        pollIds: userround.pollIds.push(newPollId),
        pollingIds: userround.pollingIds.push(result._id.toString()),
      },
    });

    return result._id.toString();
  }

  async updateRefreshedPollingById(
    user_id,
    polling_id: string,
  ): Promise<Polling | String> {
    const krtime = new Date(now().getTime() + (9 * 60 * 60 * 1000))

    // polling 가져오기.
    const polling = await this.pollingModel.findById(polling_id);

    // 3번째 친구 새로고침인지 확인
    if (!polling.refreshCount) {
      polling.refreshCount = 1;
    } else {
      if (polling.refreshCount < 2) {
        polling.refreshCount += 1;
      } else {
        return 'Exceed your free refresh count';
      }
    };
    // 친구목록 불러오기/셔플
    const friendList = await this.friendShipsService.listFriend(user_id);
    const temp_arr = friendList.data.sort(() => Math.random() - 0.5).slice(0, 4);
    // polling friendlist 갱신
    var newIds = [];
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
    var filter: FilterQuery<PollingDocument> = {};

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

  async findListPollingByProfileId(
    user_id: string,
    query: GetListReceivePollingDto,
  ): Promise<PagingResDto<PollingDto>> {
    const profile = await this.profilesService.getByUserId(user_id);

    var filter: FilterQuery<PollingDocument> = {
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

  async updateSelectedProfile(user_id, polling_id, profile_id: string) {
    const result = await this.pollingModel.findByIdAndUpdate(polling_id, {
      $set: {
        selectedProfileId: new Types.ObjectId(profile_id),
        updatedAt: now(),
      },
    });

    const userround = await this.userroundModel.findOne({
      userId: user_id,
    }).sort({createdAt: -1});

    const count = await this.checkUserroundComplete(user_id, userround)

    var completed = false;
    if (count >= 12) {
      completed = true;
      await this.updateComplete(user_id, userround._id.toString())
    }

    const res = {
      userroundId: userround._id.toString(),
      userroundCompleted: completed,
      pollingId: result._id.toString()
    }

    return res;
  }

  async checkUserroundComplete(user_id:string, userround) {
    const round = await this.userroundModel.findOne({
      userId: user_id,
    }).sort({createdAt: -1});

    const result = await this.pollingModel.find(
      {$in: userround.pollingIds}
    );

    var selecteCount = 0;
    for (const value of result){
      if (value.selectedProfileId) {
        selecteCount += 1;
      };
    };

    return selecteCount;
  }

  // 피넛을 소모. 수신투표 열기.
  async updatePollingOpen(
    user_id, polling_id: string,
    body: PollingOpenDto) {

    var opened = new Opened();

    //userId 사용하여 get profile
    const profile = await this.profilesService.getByUserId(user_id);

    // user_id의 feanut 개수 체크/차감
    const usercoin = await this.coinService.findUserCoin(user_id);

    if (usercoin.total < 5) {
      return 'Lack of total feanut amount';
    } else {
      var usecoin: UseCoinDto = new UseCoinDto();
      usecoin = {
        userId: user_id,
        useType: body.useType,
        amount: body.amount,
      };

      const usecoin_result = await this.coinService.createUseCoin(usecoin);
      await this.coinService.updateCoinAccum(user_id, -1 * body.amount);

      // polling isOpened 상태 업데이트
      opened = {
        isOpened: true,
        useCoinId: usecoin_result
      }
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
    const krtime = new Date(now().getTime() + (KR_TIME_DIFF))

    // userrounds에서 roundId 추출
    var completeRoundIds = []
    userrounds.data.forEach(element => {
      completeRoundIds.push(element.roundId)
    });

    // roundModel에서 enable, startedAt, endedAt 조건 roundId
    var enbaleRoundIds = []
    var today = new Date();
    today.setHours(0,0,0,0);
    today.setTime(today.getTime() + (KR_TIME_DIFF))
    const enbaleRounds = await this.roundModel.find(
      {
        enabled: true,
        startedAt: {$lte: today},
        endedAt: {$gt: today},
      }
    )
    enbaleRounds.forEach(element => {
      enbaleRoundIds.push(element._id.toString())
    });

    // roundModel중 userrounds roundId들 삭제.
    for(var i = 0; i < enbaleRoundIds.length; i++){
      for (var j=0; j < completeRoundIds.length; j++){
        if (enbaleRoundIds.includes(completeRoundIds[j])) { 
          enbaleRoundIds.splice(i, 1); 
          i--; 
        }
      }
    }

    // 남은 것 중 랜덤으로 하나의 라운드 아이디 선정
    const randomIndex = Math.floor(Math.random() * enbaleRoundIds.length);
    const RandomRoundId = enbaleRoundIds[randomIndex];

    // 해당 라운드에 속한 pollId 12개 생성
    var polls = []
    enbaleRounds.forEach(element => {
      if (element._id.toString() == RandomRoundId) {
        var temp = []
        temp = element.pollIds.sort(() => Math.random() - 0.5);
        polls = temp.slice(-12);
      }
    });

    // pollId에 매핑 된 polling 12개 생성
    const pollings = await this.createFirstDozen(user_id, RandomRoundId, polls)

    var userround = new UserRound();
    userround = {
      userId: user_id,
      roundId: RandomRoundId,
      pollIds: polls.slice(0, 12),
      pollingIds: pollings,
      createdAt: krtime,
    }
    await new this.userroundModel(userround).save();
    return userround
  }

  async findRecentUserRound(user_id: string) {
    const round = await this.userroundModel.findOne({
      userId: user_id,
    }).sort({createdAt: -1});

    return round;
  }

  async findUserRound(user_id: string) {
    var start = new Date();
    start.setHours(0,0,0,0);
    start.setTime(start.getTime() + (KR_TIME_DIFF))
    var end = new Date();
    end.setHours(23,59,59,999);
    end.setTime(end.getTime() + (KR_TIME_DIFF))

    const rounds = await this.userroundModel.find({
      userId: user_id,
      createdAt: { $gte: start, $lt: end },
    }).sort({createdAt: -1});

    var result = {
      todayCount: rounds.length,
      data: rounds,
    };

    return result;
  }

  async updateComplete(user_id, userround_id: string) {
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
    await this.coinService.updateCoinAccum(user_id, 2);
    return result._id.toString();
  }

  async createFirstDozen(user_id, round_id: string, polls: string[]) {
    const krtime = new Date(now().getTime() + (9 * 60 * 60 * 1000))

    var polling = new Polling();
    var isopened = new Opened();
    isopened = { isOpened: false, useCoinId: null}

    const friendList = await this.friendShipsService.listFriend(user_id);

    var pollingIds = [];
    for (const poll_id of polls) {
      // 친구목록 불러오기/셔플
      const temp_arr = friendList.data.sort(() => Math.random() - 0.5).slice(0, 4);

      var friendIds = [];
      for (const friend of temp_arr) {
        friendIds.push(friend.profileId);
      }

      polling = {
        userId: user_id,
        roundId: round_id,
        pollId: poll_id,
        friendIds: friendIds,
        opened: isopened,
        createdAt: krtime,
      }

      var savepolling = await new this.pollingModel(polling).save();
      await pollingIds.push(savepolling._id)
    }
    return pollingIds;
  }
}
