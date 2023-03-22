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
  PollingRefreshDto,
} from './dtos/polling.dto';
import { UpdatePollingDto } from './dtos/update-polling.dto';
import {
  GetListPollingDto,
  GetListReceivePollingDto,
} from './dtos/get-polling.dto';
import { UseCoinDto } from '../coins/dtos/coin.dto';
import { UsersService } from 'src/users/users.service';
import { CoinsService } from 'src/coins/conis.service';
import { FriendShipsService } from 'src/friendships/friendships.service';
import { UtilsService } from 'src/common/providers';
import { UseType } from 'src/coins/enums/usetype.enum';
import { UserRoundDto } from './dtos/userround.dto';

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
    private friendShipsService: FriendShipsService,
    private utilsService: UtilsService,
  ) {}

  async createPolling(user_id: string, body: PollingDto) {
    const result = await new this.pollingModel(body).save();
    return result._id.toString();
  }

  async updateRefreshedPollingById(
    user_id,
    polling_id: string,
    body: PollingRefreshDto,
  ): Promise<Polling | String> {
    //userId 사용하여 get profileId
    const user = await this.userService.findActiveUserById(user_id);

    // polling 가져오기.
    const polling = await this.pollingModel.findById(polling_id);

    // 3번째 친구 새로고침인지 확인
    if (polling.refreshCount < 2) {
    } else if (body.amount != 0) {
      const usercoin = await this.coinService.findUserCoin(user_id);

      if (usercoin.total < 5) {
        return 'Lack of total feanut amount';
      } else {
        var usecoin: UseCoinDto = new UseCoinDto();
        usecoin = {
          userId: user_id,
          useType: UseType.Refresh,
          amount: UseType.Refresh,
        };
        await this.coinService.createUseCoin(usecoin);
        await this.coinService.updateCoinAccum(user_id, -5);
      }
    } else {
      return 'Exceed your free refresh count';
    }
    // 친구목록 불러오기/셔플
    const friendList = await this.friendShipsService.listFriend(
      // **{user.profileId 사용안함 profile이 userId가짐}
      //user.profileId.toString()
      '',
    );
    const temp_arr = friendList.sort(() => Math.random() - 0.5).slice(0, 4);
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
    query: GetListReceivePollingDto,
  ): Promise<PagingResDto<PollingDto>> {
    var filter: FilterQuery<PollingDocument> = {
      selectedProfileId: query.profileId,
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

  async updateSelectedProfile(polling_id, profile_id: string) {
    const result = await this.pollingModel.findByIdAndUpdate(polling_id, {
      $set: {
        selectedProfileId: new Types.ObjectId(profile_id),
        updatedAt: now(),
      },
    });
    return result._id.toString();
  }

  // 피넛을 소모. 수신투표 열기.
  async updatePollingOpen(user_id, polling_id: string, body: PollingOpenDto) {
    //userId 사용하여 get profileId
    const user = await this.userService.findActiveUserById(user_id);

    // user_id의 feanut 개수 체크, 차감
    const usercoin = await this.coinService.findUserCoin(user_id);

    if (usercoin.total < 10) {
      return 'Lack of total feanut amount';
    } else {
      var usecoin: UseCoinDto = new UseCoinDto();
      usecoin = {
        userId: user_id,
        useType: body.useType,
        amount: body.amount,
      };
      await this.coinService.createUseCoin(usecoin);
      await this.coinService.updateCoinAccum(user_id, -1 * body.amount);
    }

    // polling isOpened 상태 업데이트
    const result = await this.pollingModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(polling_id),
        // **{user.profileId 사용안함 profile이 userId가짐}
        // selectedProfileId: user.profileId,
      },
      {
        $set: { isOpened: true, updatedAt: now() },
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
    // userrounds에서 roundId 추출
    var completeRoundIds = []
    userrounds.data.forEach(element => {
      completeRoundIds.push(element.roundId)
    });

    // roundModel에서 enable, startedAt, endedAt 조건 roundId
    var enbaleRoundIds = []
    var today = new Date();
    today.setHours(0,0,0,0);
    const enbaleRounds = await this.roundModel.find(
      {
        enabled: true,
        startedAt: {$gte: today},
        endedAt: {$lt: today || null},
      }
    )
    enbaleRounds.forEach(element => {
      enbaleRoundIds.push(element._id.toString())
    });

    console.log(enbaleRounds)

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

    var userround = new UserRoundDto();
    userround = {
      userId: user_id,
      roundId: RandomRoundId,
      pollIds: [],
    }
    await new this.userroundModel(userround).save();
    return userround
  }

  async findUserRound(user_id: string) {
    var start = new Date();
    start.setHours(0, 0, 0, 0);

    var end = new Date();
    end.setHours(23, 59, 59, 999);
    console.log(start);
    console.log(end);
    console.log(user_id);

    const rounds = await this.userroundModel.find({
      userId: user_id,
      completedAt: { $gte: start, $lt: end },
    });

    var result = {
      todayCount: rounds.length,
      data: rounds,
    };

    return result;
  }

  async updateComplete(user_id: string) {
    const result = await this.userroundModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(''),
        userId: user_id,
      },
      {
        $set: { complete: true, completedAt: now() },
      },
    );

    return result._id.toString();
  }
}
