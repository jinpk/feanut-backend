import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TRY_OPEN_SCHEMA_NAME } from '../statics.constant';

export type TryOpenLogDocument = HydratedDocument<TryOpenLog>;


@Schema({ collection: TRY_OPEN_SCHEMA_NAME, timestamps: true })
export class TryOpenLog {
  // pk
  _id: Types.ObjectId;

  // userId
  @Prop({ required: true, type: Types.ObjectId })
  userId: Types.ObjectId;

  // pollingId
  @Prop({ required: true, type: Types.ObjectId })
  pollingId: Types.ObjectId;

  // 생성시간
  @Prop()
  createdAt?: Date;
}

export const TryOpenLogSchema = SchemaFactory.createForClass(TryOpenLog);
