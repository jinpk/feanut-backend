import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { now, FilterQuery, Model, ProjectionFields, Types } from 'mongoose';
import { PagingResDto } from 'src/common/dtos';
import { CoinDto, PurchaseCoinDto, UseCoinDto } from './dtos';
import { Coin, CoinDocument } from './schemas/coin.schema';
import { BuyCoin, BuyCoinDocument } from './schemas/buycoin.schema';
import { UseCoin, UseCoinDocument } from './schemas/usecoin.schema';
import { GetUseCoinDto, GetBuyCoinDto } from './dtos/get-coin.dto';
import { UpdateCoinDto } from './dtos/update-coin.dto';
import { UtilsService } from 'src/common/providers';
import { IAPValidatorProvider } from './providers/iap-validator.provider';
import { IAP_PURCHASE_ITEM_AMOUNT_MAP } from './coins.constant';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CoinsService {
  private readonly logger = new Logger(CoinsService.name);
  constructor(
    @InjectModel(Coin.name) private coinModel: Model<CoinDocument>,
    @InjectModel(BuyCoin.name) private buycoinModel: Model<BuyCoinDocument>,
    @InjectModel(UseCoin.name) private usecoinModel: Model<UseCoinDocument>,
    private iapValidatorProvider: IAPValidatorProvider,
    private utilsService: UtilsService,
    private configService: ConfigService,
  ) {}

  async findUserCoin(userId: string): Promise<CoinDto> {
    const result = await this.coinModel.findOne({ userId: userId });

    return this.docToDto(result);
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

  async createBuyCoin(userId: string, body: PurchaseCoinDto) {
    const amount = IAP_PURCHASE_ITEM_AMOUNT_MAP[body.productId];
    if (!amount) {
      throw new Error('유효하지 않은 productId 입니다.');
    }

    let orderId: string;
    try {
      if (body.os === 'ios') {
        const appstoreRes = await this.iapValidatorProvider.validateIOSPurchase(
          body.receipt,
        );
        orderId = appstoreRes.receipt.in_app[0].transaction_id;
      } else {
        const { purchaseToken } = JSON.parse(body.receipt);
        const playstoreRes =
          await this.iapValidatorProvider.validateGooglePurchase(
            body.productId,
            purchaseToken,
          );
        orderId = playstoreRes.orderId;
      }
      console.log(`IAP Purchased: ${body.os} - ${orderId}`);
    } catch (error: any) {
      console.error(`IAP Purchase Validation error: ${JSON.stringify(error)}`);
      if (this.configService.get('env') === 'production') {
        throw error;
      }
    }

    const result = await new this.buycoinModel({
      userId: userId,
      os: body.os,
      productId: body.productId,
      receipt: body.receipt,
      orderId,
    }).save();

    await this.updateCoinAccum(userId, amount);
    return result._id.toString();
  }

  async createUseCoin(params: UseCoinDto) {
    const result = await new this.usecoinModel(params).save();

    await this.updateCoinAccum(params.userId, -1 * params.amount);
    return result._id;
  }

  async createCoin(userId: string) {
    await new this.coinModel({
      userId: userId,
      total: 0,
      accumLogs: [0],
    }).save();
  }

  async updateCoinAccum(userId: string, amount: number) {
    const usercoin = await this.coinModel.findOne({ userId: userId });
    usercoin.accumLogs.push(amount);

    let total = 0;
    for (const cont of usercoin.accumLogs) {
      total += cont;
    }

    usercoin.total = total;

    return usercoin.save();
  }

  async updateCoin(coin_id, userId: string, body: UpdateCoinDto) {
    const result = await this.coinModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(coin_id),
        userId: userId,
      },
      {
        $set: { body, updatedAt: now() },
      },
    );
    return result._id.toString();
  }

  async getCoinById(coin_id, userId: string) {
    const result = await this.coinModel.findOne({
      _id: new Types.ObjectId(coin_id),
      userId: userId,
    });
    return result;
  }

  docToDto(doc: Coin | CoinDocument): CoinDto {
    const dto = new CoinDto();
    dto.id = doc._id.toHexString();
    dto.userId = doc.userId;
    dto.total = doc.total;
    dto.accumLogs = doc.accumLogs;

    return dto;
  }
}
