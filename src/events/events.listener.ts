import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CoinsService } from 'src/coins/conis.service';
import { FriendshipsService } from 'src/friendships/friendships.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { ProfilesService } from 'src/profiles/profiles.service';
import { UserCreatedEvent } from 'src/users/events';

@Injectable()
export class EventsListener {
  private readonly logger = new Logger(EventsListener.name);

  constructor(
    private friendshipsService: FriendshipsService,
    private coinsService: CoinsService,
    private notificationsService: NotificationsService,
    private profilesService: ProfilesService,
  ) {}

  @OnEvent(UserCreatedEvent.name)
  async handleUserCreatedEvent(event: UserCreatedEvent) {
    this.logger.log(`${UserCreatedEvent.name} triggered: ${event.userId}`);

    try {
      const profileId =
        await this.profilesService.getOwnerLessProfileByPhoneNumber(
          event.phoneNumber,
        );

      // 프로필 정보 맵핑 | 생성
      if (profileId) {
        await this.profilesService.makeOwnerShipById(
          profileId,
          event.userId,
          event.name,
          event.gender,
          event.birth,
        );
      } else {
        await this.profilesService.create(
          event.userId,
          event.phoneNumber,
          event.name,
          event.gender,
          event.birth,
        );
      }

      // 친구목록 초기화
      await this.friendshipsService.initFriendShip(event.userId);

      // 최초 coin db 초기화
      await this.coinsService.createCoin(event.userId.toString());

      // 알림설정 초기화
      await this.notificationsService.initNotificationUserConfig(event.userId);

      this.logger.log(
        `${UserCreatedEvent.name} succesfully procceed: ${event.userId}`,
      );
    } catch (error) {
      this.logger.error(
        `${UserCreatedEvent.name} got error with ${
          event.userId
        }.: ${JSON.stringify(error)}`,
      );
    }
  }
}
