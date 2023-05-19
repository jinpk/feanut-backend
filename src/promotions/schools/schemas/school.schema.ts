import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PROMOTION_SCHOOL_SCHEMA_NAME } from '../schools.constants';
import {
  PromotionSchoolQuestion,
  PromotionSchoolQuestionSchema,
} from './question.schema';

export type PromotionSchoolDocument = HydratedDocument<PromotionSchool>;

/** 해당 스키마에 insert 되면 학교 투표 준비된 것 */
@Schema({ collection: PROMOTION_SCHOOL_SCHEMA_NAME })
export class PromotionSchool {
  // pk
  _id: Types.ObjectId;

  // 학교코드
  @Prop({ unique: true })
  code: string;

  // 시작일
  @Prop({ type: Date })
  startedAt: Date;

  // 학교 투표 질문 리스트
  @Prop({ type: [{ type: PromotionSchoolQuestionSchema }] })
  questions: PromotionSchoolQuestion[];
}

export const PromotionSchoolSchema =
  SchemaFactory.createForClass(PromotionSchool);
