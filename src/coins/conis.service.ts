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
import { CoinDto, PurchaseCoinDto, UseCoinDto } from './dtos';
import { Coin, CoinDocument } from './schemas/coin.schema';
import { BuyCoin, BuyCoinDocument } from './schemas/buycoin.schema';
import { UseCoin, UseCoinDocument } from './schemas/usecoin.schema';
import { GetUseCoinDto, GetBuyCoinDto } from './dtos/get-coin.dto';
import { UpdateCoinDto } from './dtos/update-coin.dto';
import { UtilsService } from 'src/common/providers';
import { IAPValidatorProvider } from './providers/iap-validator.provider';
import { IAP_PURCHASE_ITEM_AMOUNT_MAP } from './coins.constant';

@Injectable()
export class CoinsService {
  constructor(
    @InjectModel(Coin.name) private coinModel: Model<CoinDocument>,
    @InjectModel(UseCoin.name) private buycoinModel: Model<UseCoinDocument>,
    @InjectModel(BuyCoin.name) private usecoinModel: Model<BuyCoinDocument>,
    private iapValidatorProvider: IAPValidatorProvider,
    private utilsService: UtilsService,
  ) {}

  async findUserCoin(user_id: string): Promise<CoinDto> {
    const result = await this.coinModel.findOne({ userId: user_id });

    let coin = new CoinDto();
    coin = {
      userId: result.userId,
      total: result.total,
      accumLogs: result.accumLogs,
    };

    return coin;
  }

  async findListUsecoin(
    query: GetUseCoinDto,
  ): Promise<PagingResDto<UseCoinDto>> {
    const filter: FilterQuery<UseCoinDocument> = {};

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
      this.utilsService.getCommonMongooseFacet(query),
    ]);

    const metdata = cursor[0].metadata;
    const data = cursor[0].data;

    return {
      total: metdata[0]?.total || 0,
      data: data,
    };
  }

  async findListBuycoin(
    query: GetBuyCoinDto,
  ): Promise<PagingResDto<PurchaseCoinDto>> {
    const filter: FilterQuery<BuyCoinDocument> = {};

    const projection: ProjectionFields<PurchaseCoinDto> = {
      _id: 1,
      userId: 1,
      buyType: 1,
      createdAt: 1,
    };

    const cursor = await this.buycoinModel.aggregate([
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

  async createBuyCoin(user_id: string, body: PurchaseCoinDto) {
    const amount = IAP_PURCHASE_ITEM_AMOUNT_MAP[body.productId];
    if (!amount) {
      throw new Error('유효하지 않은 productId 입니다.');
    }

    if (body.os === 'ios') {
      await this.iapValidatorProvider.validateIOSPurchase(body.purchaseReceipt);
    } else {
      await this.iapValidatorProvider.validateGooglePurchase(
        body.productId,
        body.purchaseReceipt,
      );
    }

    const result = await new this.buycoinModel(body).save();

    await this.updateCoinAccum(user_id, amount);
    return result._id.toString();
  }

  async createUseCoin(params: UseCoinDto) {
    const result = await new this.usecoinModel(params).save();

    await this.updateCoinAccum(params.userId, -1 * params.amount);
    return result._id.toString();
  }

  async createCoin(user_id: string) {
    let coin = new Coin();
    coin = {
      userId: user_id,
      total: 3,
      accumLogs: [3],
    };
    await new this.coinModel(coin).save();
  }

  async updateCoinAccum(user_id: string, amount: number) {
    const usercoin = await this.coinModel.findOne({ userId: user_id });
    usercoin.accumLogs.push(amount);

    let total = 0;
    for (const cont of usercoin.accumLogs) {
      total += cont;
    }

    usercoin.total = total;

    return usercoin.save();
  }

  async updateCoin(coin_id, user_id: string, body: UpdateCoinDto) {
    const result = await this.coinModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(coin_id),
        userId: user_id,
      },
      {
        $set: { body, updatedAt: now() },
      },
    );
    return result._id.toString();
  }

  async getCoinById(coin_id, user_id: string) {
    const result = await this.coinModel.findOne({
      _id: new Types.ObjectId(coin_id),
      userId: user_id,
    });
    return result;
  }
}
