import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ProfileService } from '../enums';
import { PROFILE_MODULE_NAME } from '../profiles.constant';

export type ProfileDocument = HydratedDocument<Profile>;

// Profile
@Schema({ collection: PROFILE_MODULE_NAME, timestamps: true })
export class Profile {
  // pk
  id: string;

  // SNS Profile 유형
  @Prop({ required: true, enum: ProfileService })
  service: string;

  // SNS UID
  @Prop({ required: true, unique: true })
  serviceUserId: string;

  // Service Sepecific code
  @Prop({ required: false })
  serviceCode: string;

  // sns에서 받아온 사용자 이름
  @Prop({ required: true })
  nickname: string;

  // sns에서 받아온 프로필 썸네일 URL
  @Prop({})
  profileThumbnailUrl;

  // 생성시간
  @Prop()
  createdAt?: Date;
}

export const ProfileSchmea = SchemaFactory.createForClass(Profile);
