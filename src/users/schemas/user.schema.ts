import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Gender } from '../enums';
import { USER_MODULE_NAME } from '../users.constant';

export type UserDocument = HydratedDocument<User>;

// 회원
@Schema({ collection: USER_MODULE_NAME, timestamps: true })
export class User {
  // pk
  id: string;

  // 로그인 이메일
  // unique with isDeleted is false
  @Prop({ lowercase: true })
  email: string;

  // 로그인 휴대폰번호
  // unique with isDeleted is false
  @Prop({})
  phoneNumber: string;

  // 이름
  @Prop({})
  name: string;

  // 생일
  // format: YYYYMMDD
  @Prop({})
  birth: string;

  // 성별
  @Prop({ enum: Gender })
  gender: string;

  // 프로필 이미지 ID
  @Prop({ type: Types.ObjectId })
  profileImageId: Types.ObjectId;

  // 삭제여부
  @Prop({ default: false })
  isDeleted: boolean;

  // 삭제시간
  @Prop({ default: null })
  deletedAt?: Date;

  // 가입시간
  @Prop()
  createdAt?: Date;
}

export const UserSchmea = SchemaFactory.createForClass(User);
