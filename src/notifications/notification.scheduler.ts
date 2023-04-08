import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FirebaseService } from 'src/common/providers';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private notificationService: NotificationsService,
    private firebaseService: FirebaseService,
  ) {}

  @Cron('0 30 12 * * 0-6')
  async handleEveryLaunch() {
    this.logger.log('scheduling every launch time!');
    try {
      const users = await this.notificationService.getListNotificationUsers();
      if (!users.length) return;

      users.forEach((user) => {
        this.firebaseService.sendPush({
          tokens: [user.fcmToken],
          title: user.contentText.split('\n').join(' '),
          message: '참여할 수 있는 새로운 투표가 시작되었어요!',
          payload: {},
        });
      });
    } catch (error) {
      this.logger.error(
        `scheduling every launch time to failed: ${JSON.stringify(error)}`,
      );
    }
  }

  @Cron('0 30 17 * * 0-6')
  async handleEveryDinner() {
    this.logger.log('scheduling every launch time!');
    try {
      const users = await this.notificationService.getListNotificationUsers();
      if (!users.length) return;

      users.forEach((user) => {
        this.firebaseService.sendPush({
          tokens: [user.fcmToken],
          title: user.contentText.split('\n').join(' '),
          message: '참여할 수 있는 새로운 투표가 시작되었어요!',
          payload: {},
        });
      });
    } catch (error) {
      this.logger.error(
        `scheduling every dinner time to failed: ${JSON.stringify(error)}`,
      );
    }
  }

  // @Cron('0 30 12 * * 0-6')
  @Cron('* * * * * *')
  async handleEveryTest() {
    this.logger.log('scheduling every test time!');
    try {
      const users = await this.notificationService.getListNotificationUsers();
      if (!users.length) return;

      users.forEach((user) => {
        this.firebaseService.sendPush({
          tokens: [user.fcmToken],
          title: user.contentText.split('\n').join(' '),
          message: '참여할 수 있는 새로운 투표가 시작되었어요!',
          payload: {},
        });
      });
    } catch (error) {
      this.logger.error(
        `scheduling every test time to failed: ${JSON.stringify(error)}`,
      );
    }
  }
}
