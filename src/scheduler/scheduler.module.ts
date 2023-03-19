import { Module } from '@nestjs/common';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { UsersModule } from 'src/users/users.module';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [UsersModule, NotificationsModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
