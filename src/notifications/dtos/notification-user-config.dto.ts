import { ApiProperty } from '@nestjs/swagger';

export class NotificationUserConfigDto {
  @ApiProperty({ title: 'Firebase Messaging Token' })
  fcmToken: string;

  @ApiProperty({ title: '신규투표 알림 수신여부' })
  receivePoll: boolean;

  @ApiProperty({ title: '수신투표 알림 수신여부' })
  receivePull: boolean;
}

export class UpdateNotificationUserConfigDto {
  @ApiProperty({ title: 'Firebase Messaging Token' })
  fcmToken?: string;

  @ApiProperty({ title: '신규투표 알림 수신여부' })
  receivePoll?: boolean;

  @ApiProperty({ title: '수신투표 알림 수신여부' })
  receivePull?: boolean;
}
