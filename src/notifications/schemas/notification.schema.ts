import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsDateString, IsNotEmpty } from 'class-validator';
import { HydratedDocument } from 'mongoose';
import { NotificationContexts } from '../enums';

export type NotificationDocument = HydratedDocument<Notification>;

// 관리자 등록 알람
@Schema({ timestamps: true })
export class Notification {
  @Prop({ enum: NotificationContexts, default: NotificationContexts.All })
  @ApiProperty({ description: '알림종류', enum: NotificationContexts })
  context: NotificationContexts;

  @Prop()
  @ApiProperty({ description: '발송시간' })
  @IsDateString()
  @IsNotEmpty()
  sendAt: Date;

  @Prop({ default: false })
  @ApiProperty({ description: 'PUSH 발송여부' })
  sent: boolean;

  @Prop({})
  @ApiProperty({ description: 'Image Path', required: false })
  imagePath: string;

  @Prop({})
  @ApiProperty({ description: '알림제목' })
  title: string;

  @Prop({})
  @ApiProperty({ description: '알림내용' })
  message: string;

  @Prop({ default: false })
  deleted: boolean;
  @Prop({ default: null })
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
