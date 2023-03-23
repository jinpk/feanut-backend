import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now } from 'mongoose';
import { USERROUND_NAME } from '../../pollings/pollings.constant';

export type UserRoundDocument = HydratedDocument<UserRound>;

// UserRound
@Schema({ collection: USERROUND_NAME, timestamps: true })
export class UserRound {
  // userId
  @Prop({})
  userId: string;

  // roundId
  @Prop({})
  roundId: string;

  // poll 목록
  @Prop({})
  pollIds: string[];

  // skipCount
  @Prop({default: 0})
  skipCount?: number;

  // complete 여부
  @Prop({ default: false })
  complete?: boolean;

  @Prop({default: null})
  completedAt?: Date;

  // 생성시간
  @Prop({})
  createdAt?: Date;
}

export const UserRoundSchema = SchemaFactory.createForClass(UserRound);
