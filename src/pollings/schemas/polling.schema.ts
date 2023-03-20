import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Opened } from '../dtos/polling.dto';
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

  // pollId
  @Prop({})
  pollId: string;

  // pollIds
  @Prop({})
  pollIds: string[];

  // friendList
  @Prop({})
  friendIds: Types.ObjectId[];

  // selectedId
  @Prop({ type: Types.ObjectId, default: null })
  selectedProfileId: string;

  @Prop({})
  refreshCount: number;

  // selectedAt
  @Prop({})
  selectedAt: Date;

  // isOpened
  @Prop({default: Opened})
  opened: Opened;

  // 생성시간
  @Prop()
  createdAt?: Date;
}

export const PollingSchema = SchemaFactory.createForClass(Polling);
