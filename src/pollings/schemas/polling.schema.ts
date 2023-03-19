import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Emotion } from '../../polls/enums';
import { POLLING_MODULE_NAME } from '../../pollings/pollings.constant';

export type PollingDocument = HydratedDocument<Polling>;

// Polling
@Schema({ collection: POLLING_MODULE_NAME, timestamps: true })
export class Polling {
  // pk
  id: string;

  // userId
  @Prop({})
  userId: string;

  // roundId
  @Prop({})
  roundId: string;

  // pollIds
  @Prop({})
  pollIds: string[];

  // friendList
  @Prop({})
  friendIds: string[];

  // selectedId
  @Prop({})
  selectedProfileId: string;

  // selectedAt
  @Prop({})
  selectedAt: Date;

  // isOpened
  @Prop({default: false})
  isOpened: boolean;

  // 생성시간
  @Prop()
  createdAt?: Date;
}

export const PollingSchema = SchemaFactory.createForClass(Polling);
