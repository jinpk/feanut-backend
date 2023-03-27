import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { now, FilterQuery, Model, ProjectionFields, Types } from 'mongoose';
import { PagingResDto } from 'src/common/dtos';
import { ProfilesService } from 'src/profiles/profiles.service';
import { Poll, PollDocument } from '../polls/schemas/poll.schema';
import { Round, RoundDocument } from '../polls/schemas/round.schema';
import { Polling, PollingDocument } from './schemas/polling.schema';
import { UserRound, UserRoundDocument } from './schemas/userround.schema';
import { PollingDto, PollingOpenDto, Opened } from './dtos/polling.dto';
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

  async createPolling(user_id: string, userround) {
    const krtime = new Date(now().getTime() + 9 * 60 * 60 * 1000);

    let isopened = new Opened();
    isopened = { isOpened: false, useCoinId: null };

    // userround의 pollIds에 추가 되지 않은 pollId sorting
    const round = await this.roundModel.findById(userround.roundId);

    let newPollId = '';
    for (let i = 0; i < round.pollIds.length; i++) {
      if (userround.pollIds.includes(round.pollIds[i])) {
      } else {
        newPollId = round.pollIds[i];
        break;
      }
    }

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
      userroundId: userround._id.toString(),
      roundId: userround.roundId,
      pollId: newPollId,
      friendIds: friendIds,
      opened: isopened,
      createdAt: krtime,
    };

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
  ): Promise<Polling | string> {
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

  async updatePollingResult(user_id, polling_id: string, body) {
    var result = ''
    if (body.skipped){
      let polling = await this.pollingModel.findByIdAndUpdate(polling_id, {
        $set: {
          skipped: body.skipped,
          updatedAt: now(),
        },
      });
      result = polling._id.toString();
    } else {
      let polling = await this.pollingModel.findByIdAndUpdate(polling_id, {
        $set: {
          selectedProfileId: new Types.ObjectId(body.selectedProfileId),
          updatedAt: now(),
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
      await this.updateComplete(user_id, userround._id.toString());
    }

    const res = {
      pollingId: result,
      userroundId: userround._id.toString(),
      userroundCompleted: checked,
    };

    return res;
  }

  async checkUserroundComplete(user_id: string, userround) {
    const pollings = await this.pollingModel.find({
      userroundId: userround._id,
      $ne: {completedAt: null}
    });

    // userround의 pollids길이 만큼 완료가 됐는지 확인
    if (pollings.length >= userround.pollIds.length) {
      return true
    }

    return false
  }

  // 피넛을 소모. 수신투표 열기.
  async updatePollingOpen(user_id, polling_id: string, body: PollingOpenDto): Promise<string> {
    let opened = new Opened();

    //userId 사용하여 get profile
    const profile = await this.profilesService.getByUserId(user_id);

    // user_id의 feanut 개수 체크/차감
    const usercoin = await this.coinService.findUserCoin(user_id);

    if (usercoin.total < 3) {
      throw new WrappedError('Lack of total feanut amount').reject()
    } else {
      let usecoin: UseCoinDto = new UseCoinDto();
      usecoin = {
        userId: user_id,
        useType: body.useType,
        amount: 3,
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
  async createUserRound(user_id: string): Promise<UserRoundDto> {
    var today = new Date();
    today.setTime(today.setUTCHours(0,0,0,0))
    const rounds = await this.roundModel.find();

    var eventRounds = []
    rounds.forEach((element) => {
      if (element.eventRound) {
        eventRounds.push(element);
      }
    });

    // 3. 사용자가 해당 라운드 참여 했는지 확인
    // 5. 참여하지 않았으면 해당 라운드 먼저.
    // 4. 참여 했으면 index순서대로.
    // GET 가장 최근의 라운드 index
    const recentRound = await this.findRecentUserRound(user_id);

    // var nextRoundIndex: number;
    // if (rounds.length == recentRound.index) {
    //   nextRoundIndex = 0;
    // } else {
    //   nextRoundIndex = recentRound.index + 1;
    // }

    // // 해당 라운드에 속한 pollId 12개 생성
    // const nextRoundId = rounds[nextRoundIndex].roundId;

    let userround = new UserRound();
    userround = {
      userId: user_id,
      roundId: '',
      pollIds: [],
      createdAt: now(),
    };
    // await new this.userroundModel(userround).save();
    return userround;
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
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);

    const rounds = await this.userroundModel
      .find({
        userId: user_id,
        completedAt: { $gte: start, $lte: end },
      })
      .sort({ completedAt: -1 });

    const result = new FindUserRoundDto()

    this.createUserRound(user_id)

    return result;
  }

  async updateComplete(user_id, userround_id: string) {
    var curtime = new Date();
    curtime.setUTCHours(0,0,0,0);
    const result = await this.userroundModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(userround_id),
        userId: user_id,
      },
      {
        $set: { complete: true, completedAt: curtime },
      },
    );

    // 투표 완료: 코인 획득
    await this.coinService.updateCoinAccum(user_id, 2);
    return result._id.toString();
  }
}
