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

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(
    @InjectModel(NotificationUserConfig.name)
    private notificationUserConfigModel: mongoose.Model<NotificationUserConfigDocument>,
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
