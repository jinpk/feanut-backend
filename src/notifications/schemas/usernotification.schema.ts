import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { USER_NOTIFICATION_NAME } from '../notifications.constant';

export type UserDocument = HydratedDocument<User>;

// 회원
@Schema({ collection: USER_NOTIFICATION_NAME, timestamps: true })
export class User {
  // pk
  id: string;

  // userId
  @Prop({})
  userID: string;

  // inbox 알림
  @Prop({ default: true })
  enabledReceive: boolean;

  // 라운드 시작 알림
  @Prop({ default: true })
  enabledNewRound: boolean;

  // 푸시 알림
  @Prop({ default: true })
  enabledBatch: boolean;

  // fmcToken
  @Prop({})
  fcmToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
