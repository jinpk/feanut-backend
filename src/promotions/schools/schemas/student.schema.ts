import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PROMOTION_SCHOOL_STUDENT_SCHEMA_NAME } from '../schools.constants';

export type PromotionSchoolStudentDocument =
  HydratedDocument<PromotionSchoolStudent>;

/** 학생 */
@Schema({
  collection: PROMOTION_SCHOOL_STUDENT_SCHEMA_NAME,
})
export class PromotionSchoolStudent {
  // pk
  _id: Types.ObjectId;

  // 학교코드 * ID 아님
  @Prop({})
  code: string;

  // 신청 휴대폰번호 유니크 함
  @Prop({ unique: true })
  phonenNumber: string;

  // 신청시간
  createdAt?: Date;
}

export const PromotionSchoolStudentSchema = SchemaFactory.createForClass(
  PromotionSchoolStudent,
);
