import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { USER_SCHOOL_SCHEMA_NAME } from '../schools.constants';
import { User } from 'src/users/schemas/user.schema';

export type UserSchoolDocument = HydratedDocument<UserSchool>;

@Schema({ collection: USER_SCHOOL_SCHEMA_NAME, timestamps: true })
export class UserSchool {
  // pk
  _id: Types.ObjectId;

  // 회원
  @Prop({ type: Types.ObjectId, ref: User.name })
  userId: Types.ObjectId;

  // 학교코드
  @Prop({})
  code: string;

  // 학년
  @Prop({})
  grade: number;

  // 반
  @Prop({})
  room?: number;

  // 비활성화여부
  @Prop({})
  disabled?: boolean;

  // 생성시간
  @Prop()
  createdAt?: Date;
}

export const UserSchoolSchema = SchemaFactory.createForClass(UserSchool);
