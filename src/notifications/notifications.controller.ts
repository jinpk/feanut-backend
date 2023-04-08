import { Body, Controller, Get, Param, Patch, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { WrappedError } from 'src/common/errors';
import {
  NotificationUserConfigDto,
  UpdateNotificationUserConfigDto,
} from './dtos';
import { NOTIFICATION_MODULE_NAME } from './notifications.constant';
import { NotificationsService } from './notifications.service';

@ApiTags('Notification')
@Controller('notifications')
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Patch('users/:userId/config')
  @ApiOperation({
    summary: '사용자 알림 설정 수정',
    description: `변경 원하는 컬럼만 보내면 됨.
      \nproperties[]: undefiend는 수정처리 되지 않음`,
  })
  async updateUserNotificationSetting(
    @Param('userId') userId: string,
    @Body() body: UpdateNotificationUserConfigDto,
    @Request() req,
  ) {
    if (req.user.id !== userId) {
      throw new WrappedError(NOTIFICATION_MODULE_NAME).reject();
    }

    return await this.notificationsService.updateNotificationUserConfig(
      userId,
      body,
    );
  }

  @Get('users/:userId/config')
  @ApiOperation({ summary: '사용자 알림 설정 조회' })
  @ApiOkResponse({ type: NotificationUserConfigDto })
  async getUserNotificationSettings(@Param('userId') userId: string) {
    return await this.notificationsService.getNotificationUserConfig(userId);
  }

  @Get('userslist/')
  async getUtest() {
    return await this.notificationsService.getListNotificationUsers();
  }

  @Get('test')
  async test (){
    await this.notificationsService.getListNotificationUsers()
  }
}
