import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FirebaseService } from 'src/common/providers';
import { NotificationsService } from 'src/notifications/notifications.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private notificationService: NotificationsService,
    private usersService: UsersService,
    private firebaseService: FirebaseService,
  ) {}

  @Cron('0 * * * * *')
  handleEveryMinute() {
    this.logger.log('scheduling every minute!');

    this.notificationService
      .getPendingPushNotifications()
      .then(async (notifications) => {
        this.logger.log(`found ${notifications.length} pending notifications!`);
        if (!notifications.length) {
          return;
        }

        this.notificationService.sentNotifications(
          notifications.map((x) => x.id),
        );

        const tokens = await this.usersService.getActiveFCMUsers();
        this.logger.log(`found ${tokens.length} notification receviers!`);
        if (!tokens.length) {
          return;
        }

        notifications.forEach((notification) => {
          this.firebaseService.sendPush({
            tokens,
            title: notification.title,
            message: notification.message,
          });
        });
      })
      .catch((error) => {
        console.error(`get pending notifications error: `, error);
      });
  }
}
