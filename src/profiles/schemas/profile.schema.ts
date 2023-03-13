import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Gender } from '../enums';
import { PROFILE_MODULE_NAME } from '../profiles.constant';

export type ProfileDocument = HydratedDocument<Profile>;

// Profile
@Schema({ collection: PROFILE_MODULE_NAME, timestamps: true })
export class Profile {
  // pk
  id: string;

  // 이름
  @Prop({})
  name: string;

  // 생일
  // format: YYYYMMDD
  @Prop({})
  birth?: string;

  // 성별
  @Prop({ enum: Gender, required: false })
  gender?: string;

  // kakaoUserId
  @Prop({ unique: true })
  kakaoUserId: string;

  // 생성시간
  @Prop()
  createdAt?: Date;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
