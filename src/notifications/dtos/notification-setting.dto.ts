import { ApiProperty, PickType } from '@nestjs/swagger';
import { NotificationSetting } from '../schemas/notification-setting.schema';

export class NotificationSettingDto extends NotificationSetting {
  @ApiProperty({ description: 'settingId' })
  id: string;
}

export class UpdateNotificationSettingDto extends PickType(
  NotificationSetting,
  ['on', 'remindDays', 'remindTime'],
) {}
