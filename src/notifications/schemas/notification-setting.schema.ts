import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { HydratedDocument, Types, SchemaTypes } from 'mongoose';
import { NotificationSettingTypes } from '../enums';

export type NotificationSettingDocument = HydratedDocument<NotificationSetting>;

// 사용자 알림 설정
@Schema({})
export class NotificationSetting {
  @Prop({ type: SchemaTypes.ObjectId })
  @ApiProperty({ description: '사용자 Id', type: String })
  userId: Types.ObjectId;

  @Prop({ enum: NotificationSettingTypes })
  @ApiProperty({ description: '유형', enum: NotificationSettingTypes })
  @IsEnum(NotificationSettingTypes)
  type: string;

  @Prop({
    default: true,
  })
  @ApiProperty({ description: '알림 설정' })
  on: boolean;

  @Prop({})
  @ApiProperty({
    description: '리마인드 시간 (HHMM) ex) [0130, 2359]',
    required: false,
    default: '',
  })
  remindTime: string[];
}

export const NotificationSettingSchema =
  SchemaFactory.createForClass(NotificationSetting);
