import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { COIN_MODULE_NAME } from '../coins.constant';

export type CoinDocument = HydratedDocument<Coin>;

// Coin
@Schema({ collection: COIN_MODULE_NAME, timestamps: true })
export class Coin {
  // pk
  id: string;

  // profileId
  @Prop({})
  progileId: string;

  // Feanut 총 수량
  @Prop({})
  total: number;

  // feanut 적립 로그
  @Prop({})
  accumLogs: number[];

  // 생성시간
  @Prop()
  createdAt?: Date;
}

export const CoinSchema = SchemaFactory.createForClass(Coin);
