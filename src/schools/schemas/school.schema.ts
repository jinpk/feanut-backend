import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SchoolDocument = HydratedDocument<School>;

// 대학교
@Schema({ collection: 'users' })
export class School {
  // pk
  id: string;

  // 학교명
  @Prop({ unique: true })
  name: string;

  // 학과
  @Prop({ type: [String] })
  majors: [string];
}

export const SchoolSchema = SchemaFactory.createForClass(School);
