import { Injectable } from '@nestjs/common';
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
import { CoinDto, BuyCoinDto, UseCoinDto } from './dtos';
import { Coin, CoinDocument } from './schemas/coin.schema';
import { BuyCoin, BuyCoinDocument } from './schemas/buycoin.schema';
import { UseCoin, UseCoinDocument } from './schemas/usecoin.schema';
import { GetUseCoinDto, GetBuyCoinDto } from './dtos/get-coin.dto';
import { UpdateCoinDto } from './dtos/update-coin.dto';
// import { UtilsService } from 'src/common/providers';

@Injectable()
export class CoinsService {
  constructor(
    @InjectModel(Coin.name) private coinModel: Model<CoinDocument>,
    @InjectModel(Coin.name) private buycoinModel: Model<UseCoinDocument>,
    @InjectModel(Coin.name) private usecoinModel: Model<BuyCoinDocument>,
    private profilesService: ProfilesService,
  ) {}

  async findUserCoin(user_id: string): Promise<Coin> {
    const result = await this.coinModel.findOne(
      {userId: user_id}
    );

    return result
  }

  async findListUsecoin(query:GetUseCoinDto): Promise<PagingResDto<UseCoinDto>> {
    var filter: FilterQuery<UseCoinDocument> = {}

    const projection: ProjectionFields<UseCoinDto> = {
      _id: 1,
      userId: 1,
      useType: 1,
      createdAt: 1,
    };

    const cursor = await this.usecoinModel.aggregate([
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

  async findListBuycoin(query:GetBuyCoinDto): Promise<PagingResDto<BuyCoinDto>> {
    var filter: FilterQuery<BuyCoinDocument> = {}

    const projection: ProjectionFields<BuyCoinDto> = {
      _id: 1,
      userId: 1,
      buyType: 1,
      createdAt: 1,
    };

    const cursor = await this.buycoinModel.aggregate([
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

  async createBuyCoin(user_id: string, body:BuyCoinDto) {
    const result = await new this.buycoinModel(body).save()

    await this.updateCoinAccum(body.userId, body.amount)
    return result._id.toString()
  }

  async createUseCoin(params:UseCoinDto) {
    const result = await new this.usecoinModel(params).save()

    await this.updateCoinAccum(params.userId, (-1)*params.amount)
    return result._id.toString()
  }

  async updateCoinAccum(user_id: string, amount: number) {
    const usercoin = await this.coinModel.findOne({userId: user_id});
    usercoin.accumLogs.push(amount);

    var total = 0;
    for (const cont of usercoin.accumLogs) {
      total += cont;
    }

    usercoin.total = total;

    return usercoin.save()
  }

  async updateCoin(coin_id, user_id: string, body: UpdateCoinDto) {
    const result = await this.coinModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(coin_id),
        userId: user_id,
      },{ 
      $set: {body, updatedAt: now()}
    });
    return result._id.toString()
  }

  async getCoinById(coin_id, user_id: string) {
    const result = await this.coinModel.findOne(
      {
        _id: new Types.ObjectId(coin_id),
        userId: user_id,
      }
    );
    return result
  }
}