import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import {
  NotificationConfig,
  NotificationConfigSchema,
} from './schemas/notification-config.schema';
import {
  NotificationSetting,
  NotificationSettingSchema,
} from './schemas/notification-setting.schema';
import {
  NotificationUserConfig,
  NotificationUserConfigSchema,
} from './schemas/notification-user-config.schema';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    MongooseModule.forFeature([
      { name: NotificationConfig.name, schema: NotificationConfigSchema },
    ]),
    MongooseModule.forFeature([
      { name: NotificationSetting.name, schema: NotificationSettingSchema },
    ]),
    MongooseModule.forFeature([
      {
        name: NotificationUserConfig.name,
        schema: NotificationUserConfigSchema,
      },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {
  private readonly logger = new Logger(NotificationsModule.name);

  constructor(private notificationService: NotificationsService) {
    this.notificationService.getNotificationConfigs().then((configs) => {
      if (!configs.length) {
        this.logger.log('initialize notification configs');
        this.notificationService
          .initNotificationConfigs()
          .then(() => {
            this.logger.log('initialized successed!');
          })
          .catch((error) => {
            console.error('initialized failed.: ', error);
          });
      } else {
        this.logger.log('notifications configs already initialized');
      }
    });
  }
}
