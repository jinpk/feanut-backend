import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { FileType } from '../enums';
import { FILE_MODULE_NAME } from '../files.constant';

export type FileDocument = HydratedDocument<File>;

// 파일
@Schema({ collection: FILE_MODULE_NAME, timestamps: true })
export class File {
  // pk
  id: string;

  // S3 Object Key Location
  @Prop({ required: true, type: Types.ObjectId })
  userId: Types.ObjectId;

  // S3 Object Key Location
  @Prop({ required: true })
  objectKey: string;

  // S3 Object mimetype
  @Prop({ required: true })
  mimetype: string;

  // File usage type
  @Prop({ required: true, enum: FileType })
  type: string;

  // 생성시간
  @Prop()
  createdAt?: Date;
}

export const FileSchmea = SchemaFactory.createForClass(File);
