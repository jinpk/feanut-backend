import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { USERROUND_NAME } from '../../pollings/pollings.constant';

export type UserRoundDocument = HydratedDocument<UserRound>;

// UserRound
@Schema({ collection: USERROUND_NAME, timestamps: true })
export class UserRound {
  _id?: Types.ObjectId;;
  // userId
  @Prop({})
  userId: string;

  // roundId
  @Prop({})
  roundId: string;

  // poll 목록
  @Prop({})
  pollIds: string[];

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
