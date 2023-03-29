import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now, Types } from 'mongoose';
import { POLL_ROUND_SCHEMA_NAME } from '../../polls/polls.constant';

export type RoundDocument = HydratedDocument<Round>;

// Round
@Schema({ collection: POLL_ROUND_SCHEMA_NAME, timestamps: true })
export class Round {
  // pk
  _id: Types.ObjectId;

  @Prop({})
  title: string;

  @Prop({})
  index: number;

  // 속한 이벤트 ID
  @Prop({defaul: null})
  pollRoundEventId?: string;

  // 활성화 여부
  @Prop({ default: false })
  enabled: boolean;

  @Prop({})
  pollIds: string[];

  // round 활성화 시작 시간
  @Prop({})
  startedAt?: Date;

  // round 활성화 끝 시간
  @Prop({})
  endedAt?: Date;

  // 생성시간
  @Prop({})
  createdAt?: Date;
}

export const RoundSchema = SchemaFactory.createForClass(Round);
