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

  // userRoundId
  @Prop({ required: true })
  userRoundId: Types.ObjectId;

  // pollId
  @Prop({ required: true })
  pollId: Types.ObjectId;

  // friendList
  @Prop({ required: true, type: [[Types.ObjectId]] })
  friendIds: Types.ObjectId[][];

  // selectedId
  @Prop({ type: Types.ObjectId, default: null })
  selectedProfileId?: Types.ObjectId;

  // 건너뛰기 여부
  @Prop({ default: null })
  skipped?: boolean;

  @Prop({ default: 0 })
  refreshCount?: number;

  // completedAt
  @Prop({ default: null })
  completedAt?: Date;

  // isOpened
  @Prop({ default: null })
  isOpened?: boolean;

  // useCoinId
  @Prop({ default: null })
  useCoinId?: Types.ObjectId;

  // noShowed
  @Prop({})
  noShowed?: boolean;

  // 생성시간
  @Prop({})
  createdAt?: Date;
}

export const PollingSchema = SchemaFactory.createForClass(Polling);
