import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { GetNotificationsDto } from './dtos/get-notification.dto';
import {
  NotificationConfigDto,
  UpdateNotificationConfigDto,
} from './dtos/notification-config.dto';
import {
  NotificationSettingDto,
  UpdateNotificationSettingDto,
} from './dtos/notification-setting.dto';
import {
  CreateNotificationDto,
  NotificationDto,
} from './dtos/notification.dto';
import {
  NotificationConfigTypes,
  NotificationContexts,
  NotificationSettingTypes,
} from './enums';
import {
  NotificationConfig,
  NotificationConfigDocument,
} from './schemas/notification-config.schema';
import {
  NotificationSetting,
  NotificationSettingDocument,
} from './schemas/notification-setting.schema';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: mongoose.Model<NotificationDocument>,
    @InjectModel(NotificationConfig.name)
    private notificationConfigModel: mongoose.Model<NotificationConfigDocument>,
    @InjectModel(NotificationSetting.name)
    private notificationSettingModel: mongoose.Model<NotificationSettingDocument>,
  ) {}

  async updateNotificationSetting(
    id: string,
    body: UpdateNotificationSettingDto,
  ) {
    body.remindDays = body.remindDays || '';
    body.remindTime = body.remindTime || '';
    await this.notificationSettingModel.findByIdAndUpdate(id, { $set: body });
  }

  async getUserNotificationSettings(
    userId: string,
  ): Promise<NotificationSettingDto[]> {
    const docs = await this.notificationSettingModel.find({
      userId: new mongoose.Types.ObjectId(userId),
    });

    const data: NotificationSettingDto[] = docs.map((doc) =>
      this._notificationSettingDocToDto(doc),
    );

    return data;
  }

  async getPendingPushNotifications(): Promise<NotificationDto[]> {
    const now = new Date();
    const docs = await this.notificationModel.find({
      sent: false,
      context: { $ne: NotificationContexts.InApp },
      sendAt: { $lte: now },
    });

    const data: NotificationDto[] = docs.map((doc) =>
      this._notificationDocToDto(doc),
    );
    return data;
  }

  async sentNotifications(ids: string[]) {
    await this.notificationModel.updateMany(
      { _id: { $in: ids } },
      { $set: { sent: true } },
    );
  }

  async updateNotificationConfigs(
    id: string,
    body: UpdateNotificationConfigDto,
  ) {
    await this.notificationConfigModel.findByIdAndUpdate(id, { $set: body });
  }

  async getNotificationConfigs(): Promise<NotificationConfigDto[]> {
    const docs = await this.notificationConfigModel.find({});
    const data: NotificationConfigDto[] = docs.map((doc) =>
      this._notificationConfigDocToDto(doc),
    );

    return data;
  }

  async createNotification(body: CreateNotificationDto) {
    const doc = await new this.notificationModel({
      context: body.context,
      sendAt: body.sendAt,
      imagePath: body.imagePath,
      title: body.title,
      message: body.message,
    }).save();
    return doc._id.toString();
  }

  async initNotificationConfigs() {
    const configs: NotificationConfig[] = [
      {
        type: NotificationConfigTypes.Inbox,
      },
      {
        type: NotificationConfigTypes.NewRound,
      },
    ];
    for await (const config of configs) {
      await new this.notificationConfigModel(config).save();
    }
    this.logger.log(`initialized notification configs`);
  }

  async initUserNotificationSettings(userId: string) {
    const oid = new mongoose.Types.ObjectId(userId);

    const settings: NotificationSetting[] = [
      {
        type: NotificationSettingTypes.Promotion,
        on: true,
        userId: oid,
        remindDays: '',
        remindTime: '',
      },
      {
        type: NotificationSettingTypes.Service,
        on: true,
        userId: oid,
        remindDays: '',
        remindTime: '',
      },
      {
        type: NotificationSettingTypes.Reminder,
        on: true,
        userId: oid,
        remindDays: '',
        remindTime: '1230',
      },
    ];
    await this.notificationSettingModel.deleteMany({ userId: oid });

    for await (const setting of settings) {
      await new this.notificationSettingModel(setting).save();
    }
    this.logger.debug(`initialized notification setting: ${userId}`);
  }

  _notificationDocToDto(doc: NotificationDocument): NotificationDto {
    const dto = new NotificationDto();
    dto.context = doc.context;
    dto.createdAt = doc.createdAt;
    dto.id = doc._id.toString();
    dto.imagePath = doc.imagePath;
    dto.message = doc.message;
    dto.sendAt = doc.sendAt;
    dto.title = doc.title;
    return dto;
  }

  _notificationConfigDocToDto(
    doc: NotificationConfigDocument,
  ): NotificationConfigDto {
    const dto = new NotificationConfigDto();
    dto.context = doc.context;
    dto.day = doc.day;
    dto.id = doc._id.toString();
    dto.message = doc.message;
    dto.on = doc.on;
    dto.type = doc.type;
    return dto;
  }

  _notificationSettingDocToDto(
    doc: NotificationSettingDocument,
  ): NotificationSettingDto {
    const dto = new NotificationSettingDto();
    dto.id = doc._id.toString();
    dto.on = doc.on;
    dto.remindDays = doc.remindDays;
    dto.remindTime = doc.remindTime;
    dto.type = doc.type;
    dto.userId = doc.userId;
    return dto;
  }
}
