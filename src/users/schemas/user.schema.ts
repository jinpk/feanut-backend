import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { USER_MODULE_NAME } from '../users.constant';

export type UserDocument = HydratedDocument<User>;

// 회원
@Schema({ collection: USER_MODULE_NAME, timestamps: true })
export class User {
  // pk
  _id: Types.ObjectId;

  // 로그인 이메일
  // unique with isDeleted is false
  @Prop({ lowercase: true })
  email: string;

  // 로그인 kakao UID
  // unique with isDeleted is false
  @Prop({})
  kakaoId: string;

  // 계정에 연결된 profileId
  @Prop({ type: Types.ObjectId, default: null })
  profileId: Types.ObjectId;

  // 삭제여부
  @Prop({ default: false })
  isDeleted: boolean;

  // 삭제시간
  @Prop()
  deletedAt?: Date;

  // 가입시간
  @Prop()
  createdAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
