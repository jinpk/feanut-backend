import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now } from 'mongoose';
import { USECOIN_NAME } from '../coins.constant';

export type UseCoinDocument = HydratedDocument<UseCoin>;

// Use Coin
@Schema({ collection: USECOIN_NAME, timestamps: true })
export class UseCoin {
  // pk
  id: string;

  // profileId
  @Prop({})
  progileId: string;

  // feanut 사용 Type
  @Prop({})
  useType: string;

  // feanut 사용 개수
  @Prop({})
  amount: number[];

  // 생성시간
  @Prop({
      default: now()
  })
  createdAt?: Date;
}

export const UseCoinSchema = SchemaFactory.createForClass(UseCoin);
