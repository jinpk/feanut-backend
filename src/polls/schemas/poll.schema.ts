import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now } from 'mongoose';
import { Emotion } from '../enums';
import { POLL_MODULE_NAME } from '../../polls/polls.constant';
import { KR_TIME_DIFF } from 'src/common/common.constant';

export type PollDocument = HydratedDocument<Poll>;

// Poll
@Schema({ collection: POLL_MODULE_NAME, timestamps: true })
export class Poll {
  // emotion
  @Prop({})
  emotion: Emotion;

  // emoji
  @Prop({ default: 0 })
  emoji: number;

  // 본문
  @Prop({})
  contentText: string;  

  // openedCount
  @Prop({default: 0})
  isOpenedCount: number;

  // 생성시간
  @Prop({})
  createdAt?: Date;
}

export const PollSchema = SchemaFactory.createForClass(Poll);
