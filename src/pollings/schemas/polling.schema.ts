import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, now } from 'mongoose';
import { POLLING_SCHEMA_NAME } from '../../pollings/pollings.constant';

export type PollingDocument = HydratedDocument<Polling>;

// Polling
@Schema({ collection: POLLING_SCHEMA_NAME, timestamps: true })
export class Polling {
  _id?: Types.ObjectId;
  // userId
  @Prop({ required: true })
  userId: Types.ObjectId;

  // userroundId
  @Prop({ required: true })
  userroundId: Types.ObjectId;

  // pollId
  @Prop({ required: true })
  pollId: Types.ObjectId;

  // friendList
  @Prop({ required: true })
  friendIds: [Types.ObjectId[]];

  // selectedId
  @Prop({ type: Types.ObjectId, default: null })
  selectedProfileId?: Types.ObjectId;

  // 건너뛰기 여부
  @Prop({ default: null })
  skipped?: boolean;

  @Prop({ defaul: 0 })
  refreshCount?: number;

  // selecteddAt
  @Prop({ defaul: null })
  selectedAt?: Date;

  // isOpened
  @Prop({ default: null })
  isOpened?: boolean;

  // isOpened
  @Prop({ default: null })
  useCoinId?: Types.ObjectId;

  // 생성시간
  @Prop({})
  createdAt?: Date;
}

export const PollingSchema = SchemaFactory.createForClass(Polling);
