import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { USERROUND_NAME } from '../../pollings/pollings.constant';

export type UserRoundDocument = HydratedDocument<UserRound>;

// UserRound
@Schema({ collection: USERROUND_NAME, timestamps: true })
export class UserRound {
  // pk
  id: string;

  // userId
  @Prop({})
  userId: string;

  // roundId
  @Prop({})
  roundId: string;

  // complete 여부
  @Prop({})
  complete: boolean;

  // poll 목록
  @Prop({})
  pollIds: string[];

  @Prop({})
  completedAt?: Date;

  // 생성시간
  @Prop()
  createdAt?: Date;
}

export const UserRoundSchema = SchemaFactory.createForClass(UserRound);
