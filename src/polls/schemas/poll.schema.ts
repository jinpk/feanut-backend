import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Emotion } from '../enums';
import { POLL_MODULE_NAME } from '../../polls/polls.constant';

export type PollDocument = HydratedDocument<Poll>;

// Poll
@Schema({ collection: POLL_MODULE_NAME, timestamps: true })
export class Poll {
  // pk
  id: string;

  // profileId
  @Prop({})
  profileId: string;

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

export const PollSchema = SchemaFactory.createForClass(Poll);
