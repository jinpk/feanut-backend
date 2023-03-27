import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, now } from 'mongoose';
import { Opened } from '../dtos/polling.dto';
import { POLLING_MODULE_NAME } from '../../pollings/pollings.constant';

export type PollingDocument = HydratedDocument<Polling>;

// Polling
@Schema({ collection: POLLING_MODULE_NAME, timestamps: true })
export class Polling {
  _id?: Types.ObjectId;
  // userId
  @Prop({ required: true })
  userId: string;

  // userroundId
  @Prop({ required: true })
  userroundId: string;

  // pollId
  @Prop({ required: true })
  pollId: string;

  // friendList
  @Prop({ required: true })
  friendIds: Types.ObjectId[];

  // selectedId
  @Prop({ type: Types.ObjectId, default: null })
  selectedProfileId?: string;

  // 건너뛰기 여부
  @Prop({ type: Types.ObjectId, default: false })
  skipped?: boolean;

  @Prop({ defaul: 0 })
  refreshCount?: number;

  // completedAt
  @Prop({ defaul: null })
  selectedAt?: Date;

  // isOpened
  @Prop({ default: Opened })
  opened?: Opened;

  // 생성시간
  @Prop({})
  createdAt?: Date;
}

export const PollingSchema = SchemaFactory.createForClass(Polling);
