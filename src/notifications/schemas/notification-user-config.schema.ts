import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { USER_NOTIFICATION_NAME } from '../notifications.constant';

export type NotificationUserConfigDocument =
  HydratedDocument<NotificationUserConfig>;

@Schema({ collection: USER_NOTIFICATION_NAME, timestamps: true })
export class NotificationUserConfig {
  // userId
  @Prop({ required: true })
  userId: Types.ObjectId;

  // Firebase Messaging Token
  @Prop({})
  fcmToken?: string;

  // 신규투표 알림 허용
  @Prop({})
  receivePoll?: boolean;

  // 수신 알림 허용
  @Prop({})
  receivePull?: boolean;
}

export const NotificationUserConfigSchema = SchemaFactory.createForClass(
  NotificationUserConfig,
);
