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
  handleEveryLaunch() {
    this.logger.log('scheduling every launch time!');
    this.notificationService
      .getListNotificationUsers()
      .then(async (users) => {
        this.logger.log(`found ${users.length} pending notifications!`);
        if (!users.length) {
          return;
        }

        users.forEach((user) => {
        this.firebaseService.sendPush({
            tokens: [user.fcmToken],
            title: user.round.title,
            message: '참여할 수 있는 새로운 투표가 시작되었어요!',
            payload: {}
            });
        });
      })
      .catch((error) => {
        console.error(`get pending notifications error: `, error);
      });
  }

  @Cron('0 30 17 * * 0-6')
  handleEveryDinner() {
    this.logger.log('scheduling every dinner time!');
    this.notificationService
      .getListNotificationUsers()
      .then(async (users) => {
        this.logger.log(`found ${users.length} pending notifications!`);
        if (!users.length) {
          return;
        }

        users.forEach((user) => {
        this.firebaseService.sendPush({
            tokens: [user.fcmToken],
            title: user.round.title,
            message: '참여할 수 있는 새로운 투표가 시작되었어요!',
            payload: {}
            });
        });
      })
      .catch((error) => {
        console.error(`get pending notifications error: `, error);
      });
  }
}
