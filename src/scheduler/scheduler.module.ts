import { Module } from '@nestjs/common';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { UsersModule } from 'src/users/users.module';
import { SchedulerService } from './scheduler.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [UsersModule, NotificationsModule, CommonModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
