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
import { Coin, CoinDocument } from '../coins/schemas/coin.schema';
import { Polling, PollingDocument } from './schemas/polling.schema';
import { UserRound, UserRoundDocument } from './schemas/userround.schema';
import { PollingDto, PollingOpenDto, PollingRefreshDto } from './dtos/polling.dto';
import { UpdatePollingDto } from './dtos/update-polling.dto';
import { GetListPollingDto, GetPollingDto } from './dtos/get-polling.dto';
import { UseCoinDto } from '../coins/dtos/coin.dto';
import { UsersService } from 'src/users/users.service';
import { CoinsService } from 'src/coins/conis.service';
import { FriendsService } from 'src/friends/friends.service';

@Injectable()
export class PollingsService {
  constructor(
    @InjectModel(Polling.name) private pollingModel: Model<PollingDocument>,
    @InjectModel(UserRound.name) private userroundModel: Model<UserRoundDocument>,
    private profilesService: ProfilesService,
    private userService: UsersService,
    private coinService: CoinsService,
    private friendService: FriendsService,
  ) {}

  async createPolling(user_id: string, body: PollingDto){
    const result = await new this.pollingModel(body).save()
    return result._id.toString()
  }

  async updateRefreshedPollingById(
    user_id, polling_id: string,
    body: PollingRefreshDto):
    Promise<Polling | String> {
    //userId 사용하여 get profileId
    const user = await this.userService.findActiveUserById(user_id);
    
    // polling 가져오기.
    const polling = await this.pollingModel.findById(polling_id);

    // 3번째 친구 새로고침인지 확인
    if (polling.refreshCount < 2) {
    } else if (body.amount != 0) {
      const usercoin = await this.coinService.findUserCoin(user_id);

      if (usercoin.total < 5) {
        return "Lack of total feanut amount"
      } else {
        var usecoin: UseCoinDto = new UseCoinDto()
        usecoin = {
          userId: user_id,
          useType: 'refresh',
          amount: 5,
        }
        await this.coinService.createUseCoin(usecoin)
        await this.coinService.updateCoinAccum(user_id, -5)
      }
    } else {
      return "Exceed your free refresh count"
    }
    // 친구목록 불러오기/셔플
    const friendList = await this.friendService.listFriend(user.profileId.toString());
    const temp_arr = friendList.sort(() => Math.random() - 0.5).slice(0, 4)
    // polling friendlist 갱신
    var newIds = []
    for (const friend of temp_arr) {
      newIds.push(friend.profileId)
    }
    polling.friendIds = newIds;

    polling.save()

    return polling
  }

  async findListPolling(query: GetListPollingDto): Promise<PagingResDto<PollingDto>> {
    var filter: FilterQuery<PollingDocument> = {}

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
      // this.utilsService.getCommonMongooseFacet(query),
    ]);

    const metdata = cursor[0].metadata;
    const data = cursor[0].data;

    return {
      total: metdata[0]?.total || 0,
      data: data,
    };
  }

  async findListPollingByProfileId(query: GetListPollingDto): Promise<PagingResDto<PollingDto>> {
    var filter: FilterQuery<PollingDocument> = {
      selectedProfileId: query.profileId,
    }

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
      // this.utilsService.getCommonMongooseFacet(query),
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
    return result
  }

  async updatePolling(polling_id: string, body: UpdatePollingDto) {
    const result = await this.pollingModel.findByIdAndUpdate( polling_id, { 
      $set: {body, updatedAt: now()}
    });
    return result._id.toString()
  }

  async updateSelectedProfile(polling_id, profile_id: string) {
    const result = await this.pollingModel.findByIdAndUpdate( polling_id, { 
      $set: {selectedProfileId: profile_id, updatedAt: now()}
    });
    return result._id.toString()
  }

  // 피넛을 소모. 수신투표 열기.
  async updatePollingOpen(user_id, polling_id: string, body: PollingOpenDto) {
    //userId 사용하여 get profileId
    const user = await this.userService.findActiveUserById(user_id)
    
    // user_id의 feanut 개수 체크, 차감
    const usercoin = await this.coinService.findUserCoin(user_id);

    if (usercoin.total < 10) {
      return "Lack of total feanut amount"
    } else {
      var usecoin: UseCoinDto = new UseCoinDto()
      usecoin = {
        userId: user_id,
        useType: body.useType,
        amount: body.amount,
      }
      await this.coinService.createUseCoin(usecoin)
      await this.coinService.updateCoinAccum(user_id, -1*body.amount)
    }

    // polling isOpened 상태 업데이트
    const result = await this.pollingModel.findByIdAndUpdate(
      { _id: new Types.ObjectId(polling_id),
        selectedProfileId: user.profileId,
      }, { 
      $set: {isOpened: true, updatedAt: now()}
    });

    return result._id.toString()
  }

  // userRound
  async getUserRound(user_id: string) {

  }
}
