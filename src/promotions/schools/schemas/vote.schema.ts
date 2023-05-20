import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PROMOTION_SCHOOL_VOTE_SCHEMA_NAME } from '../schools.constants';
import { PromotionSchool } from './school.schema';
import { User } from 'src/users/schemas/user.schema';
import { PromotionSchoolQuestion } from './campaign.schema';

export type PromotionSchoolVoteDocument = HydratedDocument<PromotionSchoolVote>;

/** 학생 투표 */
@Schema({
  collection: PROMOTION_SCHOOL_VOTE_SCHEMA_NAME,
  timestamps: true,
})
export class PromotionSchoolVote {
  // pk
  _id: Types.ObjectId;

  // Promotion School ID
  // 캠페인 ID는 해당 학교로 어그리게이션 가능
  // 투표는 userId & schoolId & questionId 기준 1개만 가능
  @Prop({ type: Types.ObjectId, ref: PromotionSchool.name })
  schoolId: Types.ObjectId;

  // 캠페인의 질문 ID (투표 질문 ID)
  @Prop({ type: Types.ObjectId, ref: PromotionSchoolQuestion.name })
  questionId: Types.ObjectId;

  // 투표 발신자(참여자)
  @Prop({ type: Types.ObjectId, ref: User.name })
  userId: Types.ObjectId;

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
  @Prop({ type: Date, required: false })
  createdAt?: Date;
}

export const PromotionSchoolVoteSchema =
  SchemaFactory.createForClass(PromotionSchoolVote);
