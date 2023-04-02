import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { FilePurpose, SupportContentType } from '../enums';
import { FILE_SCHEMA_NAME } from '../files.constant';

export type FileDocument = HydratedDocument<File>;

// 파일
@Schema({ collection: FILE_SCHEMA_NAME, timestamps: true })
export class File {
  // pk
  _id: Types.ObjectId;

  // owner
  @Prop({ required: true, type: Types.ObjectId, ref: User.name })
  ownerId: Types.ObjectId;

  // object located key
  @Prop({ required: true })
  key: string;

  // File contentType
  @Prop({ required: true, enum: SupportContentType })
  contentType: string;

  // File usage type
  @Prop({ required: true, enum: FilePurpose })
  purpose: string;

  // File successfuly uploaded state
  @Prop({})
  isUploaded: boolean;

  // 생성시간
  @Prop()
  createdAt?: Date;
}

export const FileSchmea = SchemaFactory.createForClass(File);
