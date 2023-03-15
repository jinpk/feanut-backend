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

  // profileId
  @Prop({})
  profileId: string;

  // 생일
  // format: YYYYMMDD
  @Prop({})
  birth?: string;

  // 성별
  @Prop({ enum: Emotion })
  emotion?: string;

  // kakaoUserId
  @Prop({ unique: true })
  kakaoUserId: string;

  // 생성시간
  @Prop()
  createdAt?: Date;
}

export const PollingSchema = SchemaFactory.createForClass(Polling);
