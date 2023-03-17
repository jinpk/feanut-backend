import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { NOTIFICATION_MODULE_NAME } from '../notifications.constant';

export type UserDocument = HydratedDocument<User>;

// 회원
@Schema({ collection: NOTIFICATION_MODULE_NAME, timestamps: true })
export class User {
  // pk
  id: string;

  // 로그인 이메일
  // unique with isDeleted is false
  @Prop({ lowercase: true })
  email: string;

  // profileId
  @Prop({ type: Types.ObjectId, default: null })
  profileId: Types.ObjectId;

  // 삭제여부
  @Prop({ default: false })
  isDeleted: boolean;

  // 가입시간
  @Prop()
  createdAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
