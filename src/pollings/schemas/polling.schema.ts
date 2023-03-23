import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, now } from 'mongoose';
import { Opened } from '../dtos/polling.dto';
import { POLLING_MODULE_NAME } from '../../pollings/pollings.constant';

export type PollingDocument = HydratedDocument<Polling>;

// Polling
@Schema({ collection: POLLING_MODULE_NAME, timestamps: true })
export class Polling {
  // userId
  @Prop({required: true})
  userId: string;

  // roundId
  @Prop({required: true})
  roundId: string;

  // pollId
  @Prop({required: true})
  pollId: string;

  // friendList
  @Prop({required: true})
  friendIds: Types.ObjectId[];

  // selectedId
  @Prop({ type: Types.ObjectId, default: null })
  selectedProfileId?: string;

  @Prop({defaul:0})
  refreshCount?: number;

  // selectedAt
  @Prop({defaul:null})
  selectedAt?: Date;

  // isOpened
  @Prop({default: Opened})
  opened?: Opened;

  // 생성시간
  @Prop({default:now()})
  createdAt?: Date;
}

export const PollingSchema = SchemaFactory.createForClass(Polling);
