import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now } from 'mongoose';
import { COIN_MODULE_NAME } from '../coins.constant';

export type CoinDocument = HydratedDocument<Coin>;

// Coin
@Schema({ collection: COIN_MODULE_NAME, timestamps: true })
export class Coin {
  // userId
  @Prop({})
  userId: string;

  // Feanut 총 수량
  @Prop({ default: 0 })
  total?: number;

  // feanut 적립 로그
  @Prop({ default: [] })
  accumLogs?: number[];

  // 생성시간
  @Prop({
    default: now(),
  })
  createdAt?: Date;
}

export const CoinSchema = SchemaFactory.createForClass(Coin);
