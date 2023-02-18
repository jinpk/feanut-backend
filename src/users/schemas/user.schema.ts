import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Gender } from '../enums';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users' })
export class User {
  _id?: string;
  // 이름
  @Prop({ required: true })
  name: string;

  // ID
  // 삭제여부와 상관없이 유니크
  @Prop({ required: true, unique: true })
  username: string;

  // 비밀번호
  @Prop({ required: true })
  password: string;

  // 출생년도
  @Prop({ required: true })
  birthYear: number;

  // 성별
  @Prop({ required: true, enum: Gender })
  gender: string;

  // 삭제여부
  @Prop({ default: false })
  isDeleted: boolean;

  // 삭제시간
  @Prop()
  deletedAt: Date;

  // 가입시간
  @Prop()
  createdAt: Date;
}

export const UserSchmea = SchemaFactory.createForClass(User);
