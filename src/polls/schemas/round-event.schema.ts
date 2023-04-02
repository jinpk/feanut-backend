import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now, Types } from 'mongoose';
import { POLL_ROUND_EVENT_SCHEMA_NAME } from '../polls.constant';

export type PollRoundEventDocument = HydratedDocument<PollRoundEvent>;

// PollRoundEvent
@Schema({ collection: POLL_ROUND_EVENT_SCHEMA_NAME, timestamps: true })
export class PollRoundEvent {
  // pk
  _id?: Types.ObjectId;

  // 문구
  @Prop({ required: true })
  message: string;

  // secondary message
  @Prop({ required: true })
  subMessage: string;

  // subMessage에서 마킹처리할 문장
  @Prop({})
  markingText?: string;

  // 이모지 ID
  @Prop({})
  emojiId: Types.ObjectId;

  // 이벤트 reward 수량
  @Prop({ required: true, default: 0 })
  reward: number;

  @Prop({})
  createdAt?: Date;
}

export const PollRoundEventSchema =
  SchemaFactory.createForClass(PollRoundEvent);
