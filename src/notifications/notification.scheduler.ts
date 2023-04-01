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
    private usernService: UsersService,
    private firebaseService: FirebaseService,
  ) {}

  @Cron('0 30 12 * * 1-5')
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

//   @Cron('* * * * * *')
//   handleEveryDinner() {
//     this.logger.log('scheduling every dinner time!');
//     this.notificationService
//     .getListNotificationUsers()
//     .then(async (notifications) => {
//       this.logger.log(`found ${notifications.length} pending notifications!`);
//       if (!notifications.length) {
//         return;
//       }

//       this.logger.log(`found ${tokens.length} notification receviers!`);
//       if (!tokens.length) {
//         return;
//       }

//       notifications.forEach((notification) => {
//         this.firebaseService.sendPush({
//           tokens,
//           title: notification.title,
//           message: notification.message,
//         });
//       });
//     })
//     .catch((error) => {
//       console.error(`get pending notifications error: `, error);
//     });
}
