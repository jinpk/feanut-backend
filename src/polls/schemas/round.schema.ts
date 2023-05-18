import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { POLL_ROUND_SCHEMA_NAME } from '../../polls/polls.constant';

export type RoundDocument = HydratedDocument<Round>;

// Round
@Schema({ collection: POLL_ROUND_SCHEMA_NAME })
export class Round {
  // pk
  _id?: Types.ObjectId;

  // 라운드명 고유값
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  index: number;

  // 속한 이벤트 ID
  @Prop({ defaul: null })
  pollRoundEventId: Types.ObjectId;

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
}

export const RoundSchema = SchemaFactory.createForClass(Round);
