import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class UsersEventListener {
  private readonly logger = new Logger(UsersEventListener.name);

  constructor(private filesService: FilesService) {}

  /*
  @OnEvent(UserPatchedEvent.name)
  handleEmailLoginEvent(payload: UserPatchedEvent) {
    this.logger.log(
      `${UserPatchedEvent.name} detected: ${JSON.stringify(payload)}`,
    );

    // profileImageId 변경시 files state update
    if (payload.dto.profileImageId) {
      this.filesService.updateUploadedState(payload.dto.profileImageId);
    }
  }*/
}
