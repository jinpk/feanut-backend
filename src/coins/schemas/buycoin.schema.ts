import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now } from 'mongoose';
import { OS } from 'src/common/enums';
import { BUYCOIN_NAME } from '../coins.constant';

export type BuyCoinDocument = HydratedDocument<BuyCoin>;

// Buy Coin
@Schema({ collection: BUYCOIN_NAME, timestamps: true })
export class BuyCoin {
  // userId
  @Prop({})
  userId: string;

  // productId
  @Prop({})
  productId: string;

  // receipt
  @Prop({})
  receipt: string;

  @Prop({ enum: OS })
  os: OS;

  // 생성시간
  @Prop({})
  createdAt?: Date;
}

export const BuyCoinSchema = SchemaFactory.createForClass(BuyCoin);
