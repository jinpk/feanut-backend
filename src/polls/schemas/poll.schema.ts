import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Emotion } from '../enums';
import { POLL_SCHEMA_NAME } from '../../polls/polls.constant';

export type PollDocument = HydratedDocument<Poll>;

// Poll
@Schema({ collection: POLL_SCHEMA_NAME })
export class Poll {
  // pk
  _id: Types.ObjectId;

  // 투표명 고유값
  @Prop({ required: true, unique: true })
  name: string;

  // emotion
  @Prop({})
  emotion: Emotion;

  // emoji
  @Prop({ default: null })
  emojiId: string;

  // 본문
  @Prop({})
  contentText: string;

  // 초등학생용 질문만 true 그 외 undefined
  @Prop({})
  kids?: boolean;

  // openedCount
  @Prop({ default: 0 })
  isOpenedCount: number;
}

export const PollSchema = SchemaFactory.createForClass(Poll);
