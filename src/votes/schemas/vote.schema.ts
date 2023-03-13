import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Emotion } from '../enums';
import { VOTE_MODULE_NAME } from '../votes.constant';

export type VoteDocument = HydratedDocument<Vote>;

// Vote
@Schema({ collection: VOTE_MODULE_NAME, timestamps: true })
export class Vote {
  // pk
  id: string;

  // profileId
  @Prop({})
  progileId: string;

  // 생일
  // format: YYYYMMDD
  @Prop({})
  birth?: string;

  // 성별
  @Prop({ enum: Emotion })
  emotion?: string;

  // kakaoUserId
  @Prop({ unique: true })
  kakaoUserId: string;

  // 생성시간
  @Prop()
  createdAt?: Date;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);
