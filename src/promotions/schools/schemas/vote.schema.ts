import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PROMOTION_SCHOOL_VOTE_SCHEMA_NAME } from '../schools.constants';
import { PromotionSchoolStudent } from './student.schema';
import { PromotionSchoolQuestion } from './question.schema';

export type PromotionSchoolVoteDocument = HydratedDocument<PromotionSchoolVote>;

/** 학생 투표 */
@Schema({
  collection: PROMOTION_SCHOOL_VOTE_SCHEMA_NAME,
})
export class PromotionSchoolVote {
  // pk
  _id: Types.ObjectId;

  // 투표 ID
  @Prop({ type: Types.ObjectId, ref: PromotionSchoolQuestion.name })
  schoolQuestionId: Types.ObjectId;

  // 투표 발신자
  @Prop({ type: Types.ObjectId, ref: PromotionSchoolStudent.name })
  studentId: Types.ObjectId;

  /** 투표 수신자 */
  // 학년
  @Prop({})
  grade: string;

  // 반
  @Prop({})
  class: string;

  // 이름
  @Prop({})
  name: string;

  // 투표시간
  createdAt?: Date;
}

export const PromotionSchoolVoteSchema =
  SchemaFactory.createForClass(PromotionSchoolVote);
