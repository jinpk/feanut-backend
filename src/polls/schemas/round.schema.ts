import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Emotion } from '../enums';
import { ROUND_MODULE_NAME } from '../../polls/polls.constant';

export type RoundDocument = HydratedDocument<Round>;

// Round
@Schema({ collection: ROUND_MODULE_NAME, timestamps: true })
export class Round {
  // pk
  id: string;

  @Prop({default: false})
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
  @Prop()
  createdAt?: Date;
}

export const RoundSchema = SchemaFactory.createForClass(Round);
