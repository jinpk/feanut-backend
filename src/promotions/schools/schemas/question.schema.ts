import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PromotionSchoolQuestionDocument =
  HydratedDocument<PromotionSchoolQuestion>;

/** 학교 질문 */
/** Nested Schema */
@Schema({
  timestamps: false,
})
export class PromotionSchoolQuestion {
  // pk
  _id: Types.ObjectId;

  // 질문 제목
  @Prop({})
  title: string;
}

export const PromotionSchoolQuestionSchema = SchemaFactory.createForClass(
  PromotionSchoolQuestion,
);
