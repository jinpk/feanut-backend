import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Gender } from '../enums';
import { SCHEMA_NAME } from '../profiles.constant';

export type ProfileDocument = HydratedDocument<Profile>;

@Schema({ collection: SCHEMA_NAME, timestamps: true })
export class Profile {
  // pk
  id: string;

  // 카카오 사용자 ID
  @Prop({})
  kakaoUserId: string;

  // 카카오톡 이름
  @Prop({})
  name: string;

  // 카카오톡 생일
  // format: YYYYMMDD
  @Prop({ maxlength: 8 })
  birth?: string;

  // 카카오톡 성별
  @Prop({ enum: Gender, required: false })
  gender?: Gender;

  @Prop()
  profileImageURL?: string;

  @Prop()
  thumbnailURL?: string;

  // 생성시간
  @Prop()
  createdAt?: Date;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
