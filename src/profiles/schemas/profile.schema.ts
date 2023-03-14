import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Gender } from '../enums';
import { SCHEMA_NAME } from '../profiles.constant';

export type ProfileDocument = HydratedDocument<Profile>;

@Schema({ collection: SCHEMA_NAME, timestamps: true })
export class Profile {
  // pk
  id: string;

  // 이름
  @Prop({})
  name: string;

  // 생일
  // format: YYYYMMDD
  @Prop({ maxlength: 8 })
  birth?: string;

  // 성별
  @Prop({ enum: Gender, required: false })
  gender?: Gender;

  // 카카오 사용자 ID
  @Prop({})
  kakaoUserId: string;

  // 프로필 삭제 여부
  @Prop({})
  isDeleted?: boolean;

  // 생성시간
  @Prop()
  createdAt?: Date;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
