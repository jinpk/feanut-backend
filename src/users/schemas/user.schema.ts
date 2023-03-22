import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { USER_MODULE_NAME } from '../users.constant';

export type UserDocument = HydratedDocument<User>;

// 회원
@Schema({ collection: USER_MODULE_NAME, timestamps: true })
export class User {
  // pk
  _id?: Types.ObjectId;

  // feanut ID
  // 전역으로 unique
  @Prop({ lowercase: true, unique: true })
  username: string;

  @Prop({})
  password?: string;

  @Prop({})
  phoneNumber: string;

  @Prop({})
  refreshToken?: string;

  // 탈퇴여부
  @Prop({ default: false })
  isDeleted?: boolean;

  // 탈퇴시간
  @Prop()
  deletedAt?: Date;

  // 가입시간
  @Prop()
  createdAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
