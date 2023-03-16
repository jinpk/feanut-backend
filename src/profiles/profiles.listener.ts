import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FriendsService } from 'src/friends/friends.service';
import { ProfileCreatedEvent } from './events';

@Injectable()
export class ProfilesEventListener {
  private readonly logger = new Logger(ProfilesEventListener.name);

  constructor(private friendsService: FriendsService) {}

  @OnEvent(ProfileCreatedEvent.name)
  async handleProfileCreatedEvent(payload: ProfileCreatedEvent) {
    this.logger.log(
      `${ProfileCreatedEvent.name} detected: ${JSON.stringify(payload)}`,
    );

    try {
      await this.friendsService.initProfileFriendsById(payload.profileId);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
