import { ApiProperty, PickType } from '@nestjs/swagger';
import { NotificationConfig } from '../schemas/notification-config.schema';

export class NotificationConfigDto extends NotificationConfig {
  @ApiProperty({})
  id: string;
}

export class UpdateNotificationConfigDto extends PickType(NotificationConfig, [
  'message',
  'day',
  'on',
  'context',
] as const) {}
