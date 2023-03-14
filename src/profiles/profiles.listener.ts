import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FilesService } from 'src/files/files.service';
import { FriendsService } from 'src/friends/friends.service';
import { ProfileCreatedEvent, ProfileUpdatedEvent } from './events';

@Injectable()
export class ProfilesEventListener {
  private readonly logger = new Logger(ProfilesEventListener.name);

  constructor(
    private filesService: FilesService,
    private friendsService: FriendsService,
  ) {}

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

  @OnEvent(ProfileUpdatedEvent.name)
  handleProfileUpdatedEvent(payload: ProfileUpdatedEvent) {
    this.logger.log(
      `${ProfileUpdatedEvent.name} detected: ${JSON.stringify(payload)}`,
    );

    // profileImageId 변경시 files state update
    if (payload.dto.profileImageId) {
      this.filesService.updateUploadedState(payload.dto.profileImageId);
    }
  }
}
