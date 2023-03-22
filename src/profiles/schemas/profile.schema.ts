import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { File } from 'src/files/schemas/files.schema';
import { User } from 'src/users/schemas/user.schema';
import { Gender } from '../enums';
import { PROFILE_SCHEMA_NAME } from '../profiles.constant';

export type ProfileDocument = HydratedDocument<Profile>;

@Schema({ collection: PROFILE_SCHEMA_NAME, timestamps: true })
export class Profile {
  // pk
  id: string;

  // 이름
  @Prop({ required: true })
  name: string;

  // 생년월일
  // format: YYYYMMDD
  @Prop({ maxlength: 8, required: true })
  birth?: string;

  // 성별
  @Prop({ enum: Gender, required: true })
  gender?: Gender;

  // hashed 전화번호
  @Prop({ required: true })
  hashedPhoneNumber?: string;

  // 프로필이미지 ID
  @Prop({ type: Types.ObjectId, ref: File.name })
  imageFileId?: Types.ObjectId;

  // 프로필 Owner User
  @Prop({ type: Types.ObjectId, ref: User.name })
  ownerId?: Types.ObjectId;

  // 생성시간
  @Prop()
  createdAt?: Date;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
