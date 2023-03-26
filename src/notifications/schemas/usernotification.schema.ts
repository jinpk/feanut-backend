import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { USER_NOTIFICATION_NAME } from '../notifications.constant';

export type UserNotificationDocument = HydratedDocument<UserNotification>;

@Schema({ collection: USER_NOTIFICATION_NAME, timestamps: true })
export class UserNotification {
  // userId
  @Prop({})
  userID: string;

  // fmcToken
  @Prop({})
  fcmToken: string;
}

export const UserNotificationSchema = SchemaFactory.createForClass(UserNotification);
