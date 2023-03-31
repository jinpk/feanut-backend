import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {
  NotificationUserConfigDto,
  UpdateNotificationUserConfigDto,
} from './dtos';
import {
  NotificationUserConfig,
  NotificationUserConfigDocument,
} from './schemas/notification-user-config.schema';
import { FirebaseService } from 'src/common/providers';
import { ProfilesService } from 'src/profiles/profiles.service';
import { PollsService } from 'src/polls/polls.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(
    @InjectModel(NotificationUserConfig.name)
    private notificationUserConfigModel: mongoose.Model<NotificationUserConfigDocument>,
    private firebaseService: FirebaseService,
    private profilesService: ProfilesService,
    private pollsService: PollsService,
  ) {}

  async initNotificationUserConfig(userId: string | mongoose.Types.ObjectId) {
    await new this.notificationUserConfigModel({
      userId: new mongoose.Types.ObjectId(userId),
      receivePoll: true,
      receivePull: true,
    }).save();
  }

  async updateNotificationUserConfig(
    userId: string | mongoose.Types.ObjectId,
    dto: UpdateNotificationUserConfigDto,
  ) {
    const config = await this.notificationUserConfigModel.findOneAndUpdate({
      userId: new mongoose.Types.ObjectId(userId),
    });

    // !== undefined > 프론트에서 수정요청 보낸것만 처리
    if (dto.fcmToken !== undefined) {
      if (dto.fcmToken) {
        config.fcmToken = dto.fcmToken;
      } else {
        config.fcmToken = undefined;
      }
    }

    if (dto.receivePoll !== undefined) {
      dto.receivePoll = dto.receivePoll;
    }

    if (dto.receivePull !== undefined) {
      dto.receivePull = dto.receivePull;
    }

    await config.save();
  }

  async getNotificationUserConfig(userId: string | mongoose.Types.ObjectId) {
    const config = await this.notificationUserConfigModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    return config;
  }

  async sendInboxPull(
    pollingId: string | mongoose.Types.ObjectId,
    pollId: string | mongoose.Types.ObjectId,
    profileId: string | mongoose.Types.ObjectId,
  ) {
    const profile = await this.profilesService.getById(profileId);
    if (profile.ownerId) {
      const userConfig = await this.getNotificationUserConfig(profile.ownerId);
      if (userConfig.fcmToken && userConfig.receivePull) {
        const poll = await this.pollsService.findPollById(pollId);
        await this.firebaseService.sendPush({
          tokens: [userConfig.fcmToken],
          title: '누군가가 ' + profile.name + '님을 투표에서 선택했어요!',
          message: poll.contentText,
        });
      }
    }
  }

  notificationUserConfigDocToDto(
    doc: NotificationUserConfigDocument | NotificationUserConfig,
  ): NotificationUserConfigDto {
    const dto = new NotificationUserConfigDto();
    dto.fcmToken = doc.fcmToken;
    dto.receivePoll = doc.receivePoll;
    dto.receivePull = doc.receivePull;

    return dto;
  }
}
