import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import {
  NotificationUserConfig,
  NotificationUserConfigSchema,
} from './schemas/notification-user-config.schema';
import { ProfilesModule } from 'src/profiles/profiles.module';
import { PollsModule } from 'src/polls/polls.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: NotificationUserConfig.name,
        schema: NotificationUserConfigSchema,
      },
    ]),
    ProfilesModule,
    PollsModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
