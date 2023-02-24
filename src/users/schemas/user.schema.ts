import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Gender } from '../enums';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users' })
export class User {
  // 로그인 이메일
  // unique with isDeleted is false
  @Prop({ lowercase: true })
  email: string;

  // 로그인 휴대폰번호
  // unique with isDeleted is false
  @Prop({})
  phoneNumber: string;

  // 이름
  @Prop({ required: true })
  name: string;

  // 생일
  // format: YYYYMMDD
  @Prop({ required: true })
  birth: string;

  // 성별
  @Prop({ required: true, enum: Gender })
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
