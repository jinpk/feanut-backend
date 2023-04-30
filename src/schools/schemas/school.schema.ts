import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SCHOOL_SCHEMA_NAME } from '../schools.constants';
import { SchoolLevels } from '../enums';

export type SchoolDocument = HydratedDocument<School>;

@Schema({ collection: SCHOOL_SCHEMA_NAME })
export class School {
  // pk
  _id: Types.ObjectId;

  // 학교코드
  @Prop({ unique: true })
  code: string;

  // 학교명
  @Prop({})
  name: string;

  @Prop({ enum: SchoolLevels })
  level: SchoolLevels;

  // 시도
  @Prop()
  sido: string;

  // 시군구
  @Prop()
  sigungu: string;

  // 우편번호
  @Prop({})
  zipcode: string;

  // 학교주소
  @Prop({})
  address: string;
}

export const SchoolSchema = SchemaFactory.createForClass(School);
