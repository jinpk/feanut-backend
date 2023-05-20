import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PROMOTION_SCHOOL_CAMPAIGN_SCHEMA_NAME } from '../schools.constants';

/** 학교 질문 */
export type PromotionSchoolQuestionDocument =
  HydratedDocument<PromotionSchoolQuestion>;

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

/** 캠페인 */
export const PromotionSchoolQuestionSchema = SchemaFactory.createForClass(
  PromotionSchoolQuestion,
);

export type PromotionSchoolCampaignDocument =
  HydratedDocument<PromotionSchoolCampaign>;

@Schema({ collection: PROMOTION_SCHOOL_CAMPAIGN_SCHEMA_NAME })
export class PromotionSchoolCampaign {
  // pk
  _id: Types.ObjectId;

  // Display Name
  @Prop({})
  name: String;

  // 캠페인 시작일
  @Prop({ type: Date })
  startedAt: Date;

  // 캠페인 종료일
  @Prop({ type: Date })
  endedAt: Date;

  // 해당 캠페인에 참여한 학교의 투표 가능 시간
  // unixtime 단위로 3일인 경우 259200로 저장
  // 학교에 설정된 startedAt + 259200이 해당 학교의 투표 가능 기간
  @Prop()
  period: number;

  // 캠페인 투표 질문 리스트
  @Prop({ type: [{ type: PromotionSchoolQuestionSchema }] })
  questions: PromotionSchoolQuestion[];
}

export const PromotionSchoolCampaignSchema = SchemaFactory.createForClass(
  PromotionSchoolCampaign,
);
