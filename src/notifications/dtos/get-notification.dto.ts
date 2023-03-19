import { ApiProperty } from '@nestjs/swagger';
import { NotificationContexts } from '../enums';

export class GetNotificationsDto {
  @ApiProperty({ description: '알림종류', enum: NotificationContexts })
  context: NotificationContexts;
}
