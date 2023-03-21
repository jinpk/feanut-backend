import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Gender } from '../enums';
import { SCHEMA_NAME } from '../profiles.constant';

export type ProfileDocument = HydratedDocument<Profile>;

@Schema({ collection: SCHEMA_NAME, timestamps: true })
export class Profile {
  // pk
  id: string;

  // // 카카오 사용자 ID
  // @Prop({})
  // kakaoUserId: string;

  // 이름
  @Prop({ required: true })
  name: string;

  // 카카오톡 생일
  // format: YYYYMMDD
  @Prop({ maxlength: 8, required: true })
  birth?: string;

  // 성별
  @Prop({ enum: Gender, required: true })
  gender?: Gender;

  @Prop()
  mobile?: string;

  @Prop()
  profileImageURL?: string;

  @Prop()
  thumbnailURL?: string;

  // 생성시간
  @Prop()
  createdAt?: Date;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
