import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now } from 'mongoose';
import { BUYCOIN_NAME } from '../coins.constant';
import { BuyType } from '../enums';

export type BuyCoinDocument = HydratedDocument<BuyCoin>;

// Buy Coin
@Schema({ collection: BUYCOIN_NAME, timestamps: true })
export class BuyCoin {
  // userId
  @Prop({})
  userId: string;

  // feanut 결제 Type
  @Prop({})
  buyType: BuyType;

  // productId
  @Prop({})
  productId: string;

  // token
  @Prop({})
  token: string;

  // feanut 결제 개수
  @Prop({})
  amount: number;

  // 생성시간
  @Prop({
    default: now(),
  })
  createdAt?: Date;
}

export const BuyCoinSchema = SchemaFactory.createForClass(BuyCoin);
