import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { POLLING_USER_ROUND_SCHEMA_NAME } from '../../pollings/pollings.constant';

export type UserRoundDocument = HydratedDocument<UserRound>;

// UserRound
@Schema({ collection: POLLING_USER_ROUND_SCHEMA_NAME, timestamps: true })
export class UserRound {
  _id?: Types.ObjectId;
  // userId
  @Prop({})
  userId: Types.ObjectId;

  // roundId
  @Prop({})
  roundId: Types.ObjectId;

  // poll 목록
  @Prop({})
  pollIds: string[];

  // userRound target
  @Prop({})
  target: number;

  // pollingIds
  @Prop({})
  pollingIds: Types.ObjectId[];

  // complete 여부
  @Prop({ default: false })
  complete?: boolean;

  @Prop({ default: null })
  completedAt?: Date;

  // 생성시간
  @Prop({})
  createdAt?: Date;
}

export const UserRoundSchema = SchemaFactory.createForClass(UserRound);
