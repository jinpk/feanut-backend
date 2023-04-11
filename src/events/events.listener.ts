import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SignOutEvent } from 'src/auth/events';
import { CoinsService } from 'src/coins/conis.service';
import { FriendshipsService } from 'src/friendships/friendships.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PollingVotedEvent } from 'src/pollings/events';
import { ProfilesService } from 'src/profiles/profiles.service';
import { UserCreatedEvent, UserDeletedEvent } from 'src/users/events';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class EventsListener {
  private readonly logger = new Logger(EventsListener.name);

  constructor(
    private friendshipsService: FriendshipsService,
    private coinsService: CoinsService,
    private notificationsService: NotificationsService,
    private profilesService: ProfilesService,
    private usersService: UsersService,
  ) {}

  @OnEvent(UserCreatedEvent.name)
  async handleUserCreatedEvent(event: UserCreatedEvent) {
    this.logger.log(
      `${UserCreatedEvent.name} triggered userId: ${event.userId}`,
    );

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
        );
      } else {
        await this.profilesService.create(
          event.userId,
          event.phoneNumber,
          event.name,
          event.gender,
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

  @OnEvent(UserDeletedEvent.name)
  async handleUserDeletedEvent(event: UserDeletedEvent) {
    this.logger.log(
      `${UserDeletedEvent.name} triggered userId: ${event.userId}`,
    );

    try {
      const profile = await this.profilesService.getByUserId(event.userId);
      // 친구목록 삭제
      await this.friendshipsService.removeFriendsAllByProfileId(profile._id);
      // fcm clear
      await this.notificationsService.updateNotificationUserConfig(
        event.userId,
        { fcmToken: '' },
      );
    } catch (error) {
      this.logger.error(
        `${UserDeletedEvent.name} got error with ${
          event.userId
        }.: ${JSON.stringify(error)}`,
      );
    }
  }

  @OnEvent(SignOutEvent.name)
  async handleSignOutEvent(event: SignOutEvent) {
    this.logger.log(`${SignOutEvent.name} triggered userId: ${event.userId}`);

    try {
      // clear refresh token
      await this.usersService.updateRefreshTokenById(event.userId, undefined);
      // fcm clear
      await this.notificationsService.updateNotificationUserConfig(
        event.userId,
        { fcmToken: '' },
      );
    } catch (error) {
      this.logger.error(
        `${SignOutEvent.name} got error with ${event.userId}.: ${JSON.stringify(
          error,
        )}`,
      );
    }
  }

  @OnEvent(PollingVotedEvent.name)
  async handlePollingVotedEvent(event: PollingVotedEvent) {
    this.logger.log(
      `${PollingVotedEvent.name} triggered pollingId: ${event.pollingId}`,
    );
    // 수신자 있는 경우 수신자에게 푸시알림 전송
    if (event.selectedProfileId) {
      this.notificationsService.sendInboxPull(
        event.pollingId,
        event.pollId,
        event.selectedProfileId,
      );
    }
  }
}
