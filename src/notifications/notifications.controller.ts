import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiOkResponsePaginated } from 'src/common/decorators';
import { GetNotificationsDto } from './dtos/get-notification.dto';
import {
  NotificationConfigDto,
  UpdateNotificationConfigDto,
} from './dtos/notification-config.dto';
import {
  NotificationSettingDto,
  UpdateNotificationSettingDto,
} from './dtos/notification-setting.dto';
import {
  CreateNotificationDto,
  NotificationDto,
} from './dtos/notification.dto';
import { NotificationConfigTypes } from './enums';
import { NotificationsService } from './notifications.service';

@ApiTags('Notification')
@Controller('notifications')
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Put('settings/:id')
  @ApiOperation({ summary: '사용자 알림 설정 수정' })
  @ApiParam({ name: 'id', description: 'settingId' })
  async updateUserNotificationSetting(
    @Param('id') id: string,
    @Body() body: UpdateNotificationSettingDto,
  ) {
    return await this.notificationsService.updateNotificationSetting(id, body);
  }

  @Get('settings')
  @ApiOperation({ summary: '사용자 알림 설정 조회' })
  @ApiOkResponse({ type: [NotificationSettingDto] })
  async getUserNotificationSettings(@Query('userId') userId: string) {
    return await this.notificationsService.getUserNotificationSettings(userId);
  }

  @Put('configs/:id')
  @ApiOperation({
    summary: '자동 알림 규칙 수정',
    description: 'body 값 전부 넣어줘야 함. (default GET)',
  })
  @ApiParam({ name: 'id', description: 'configId' })
  async updateConfig(
    @Param('id') id: NotificationConfigTypes,
    @Body() body: UpdateNotificationConfigDto,
  ) {
    await this.notificationsService.updateNotificationConfigs(id, body);
  }

  @Get('configs')
  @ApiOperation({ summary: '자동 알림 규칙 조회' })
  @ApiOkResponse({ type: [NotificationConfigDto] })
  async getConfigs() {
    return await this.notificationsService.getNotificationConfigs();
  }

  @Post('')
  @ApiOperation({ summary: '알림 등록' })
  async createNotification(@Body() body: CreateNotificationDto) {
    return await this.notificationsService.createNotification(body);
  }

  // @Get('')
  // @ApiOperation({ summary: '알림 조회' })
  // @ApiOkResponsePaginated(NotificationDto)
  // async listNotification(@Query() query: GetNotificationsDto) {
  //   return await this.notificationsService.getPagingNotifications(query);
  // }
}
