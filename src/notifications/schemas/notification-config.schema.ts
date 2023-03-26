import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { HydratedDocument } from 'mongoose';
import { NotificationConfigTypes } from '../enums';

export type NotificationConfigDocument = HydratedDocument<NotificationConfig>;

// 시스템 알림 설정
@Schema()
export class NotificationConfig {
  @Prop({
    enum: NotificationConfigTypes,
  })
  @ApiProperty({ description: '자동 알림 유형', enum: NotificationConfigTypes })
  @IsEnum(NotificationConfigTypes)
  @IsNotEmpty()
  type: string;

  @Prop({
    default: false,
  })
  @ApiProperty({ description: '자동 알림' })
  on?: boolean;

  @Prop({ default: '' })
  @ApiProperty({ description: '알림 메시지' })
  message?: string;

  @Prop({ default: '' })
  @ApiProperty({ description: 'type별 알림 발송 계산 기간' })
  day?: number;
}

export const NotificationConfigSchema =
  SchemaFactory.createForClass(NotificationConfig);
