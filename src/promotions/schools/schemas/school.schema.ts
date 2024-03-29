import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PROMOTION_SCHOOL_SCHEMA_NAME } from '../schools.constants';
import { PromotionSchoolCampaign } from './campaign.schema';

export type PromotionSchoolDocument = HydratedDocument<PromotionSchool>;

/** 해당 스키마에 insert 되면 학교 투표 준비된 것 */
@Schema({ collection: PROMOTION_SCHOOL_SCHEMA_NAME })
export class PromotionSchool {
  // pk
  _id: Types.ObjectId;

  // 캠페인 ID
  @Prop({ type: Types.ObjectId, ref: PromotionSchoolCampaign.name })
  campaignId: Types.ObjectId;

  // 학교코드
  @Prop({})
  code: string;

  // 학교 투표 시작일
  @Prop({ type: Date })
  startedAt: Date;
}

export const PromotionSchoolSchema =
  SchemaFactory.createForClass(PromotionSchool);
