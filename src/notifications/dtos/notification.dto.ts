import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Notification } from '../schemas/notification.schema';

export class NotificationDto extends OmitType(Notification, [
  'deleted',
  'deletedAt',
  'updatedAt',
] as const) {
  @ApiProperty({})
  id: string;
}

export class CreateNotificationDto extends OmitType(NotificationDto, [
  'id',
] as const) {}
