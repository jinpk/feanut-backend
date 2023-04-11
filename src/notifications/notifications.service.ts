import { Injectable } from '@nestjs/common';
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
    const config = await this.notificationUserConfigModel.findOne({
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
      config.receivePoll = dto.receivePoll;
    }

    if (dto.receivePull !== undefined) {
      config.receivePull = dto.receivePull;
    }

    await config.save();
  }

  async getNotificationUserConfig(userId: string | mongoose.Types.ObjectId) {
    const config = await this.notificationUserConfigModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    return config;
  }

  async getListNotificationUsers() {
    let users = await this.notificationUserConfigModel.aggregate([
      {
        $match: {
          receivePoll: true,
          fcmToken: { $exists: true, $ne: '' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'owner',
        },
      },
      {
        $unwind: {
          path: '$owner',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          'owner._id': 0,
          'owner.__v': 0,
          'owner.phoneNumber': 0,
          'owner.createdAt': 0,
          'owner.updatedAt': 0,
          'owner.refreshToken': 0,
        },
      },
    ]);

    let polls = await this.pollsService.findListPublicPoll({
      limit: 12,
      page: 1,
    });

    if (polls.data.length > 0) {
      polls.data = polls.data.sort(() => Math.random() - 0.5);
    }

    // 삭제된 유저 sort
    users = users.filter((element) => {
      if (element.owner) {
        return !element.owner.isDeleted;
      } else {
        return true;
      }
    });

    let i = 0;
    for (let user of users) {
      user.contentText = polls.data[i].contentText;
      i++;
      if (i == polls.data.length) {
        i = 0;
      }
    }

    return users;
  }

  // async getListNotificationUsersUsingRoundTitle() {
  //   const users = await this.notificationUserConfigModel.aggregate([
  //     {
  //       $match: {
  //         receivePoll: true,
  //         fcmToken: { $exists: true, $ne: '' },
  //       },
  //     },
  //     {
  //       $project: {
  //         _id: 0,
  //         receivePull: 0,
  //         createdAt: 0,
  //         updatedAt: 0,
  //         __v: 0,
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: 'polling_user_rounds',
  //         let: { user_id: '$userId' },
  //         pipeline: [
  //           {
  //             $match: {
  //               $expr: {
  //                 $eq: ['$userId', '$$user_id'],
  //               },
  //             },
  //           },
  //           {
  //             $sort: { createdAt: -1 },
  //           },
  //           {
  //             $limit: 1,
  //           },
  //         ],
  //         as: 'userrounds',
  //       },
  //     },
  //     {
  //       $unwind: {
  //         path: '$userrounds',
  //         preserveNullAndEmptyArrays: true,
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: 'poll_rounds',
  //         let: { round_id: '$userrounds.roundId' },
  //         pipeline: [
  //           {
  //             $match: {
  //               $expr: {
  //                 $eq: ['$_id', '$$round_id'],
  //               },
  //             },
  //           },
  //           {
  //             $project: {
  //               _id: 0,
  //               userId: 0,
  //               title: 0,
  //             },
  //           },
  //         ],
  //         as: 'round',
  //       },
  //     },
  //     {
  //       $unwind: {
  //         path: '$round',
  //         preserveNullAndEmptyArrays: true,
  //       },
  //     },
  //     {
  //       $project: {
  //         'round._id': 0,
  //         'round.title': 0,
  //         'round.pollRoundEventId': 0,
  //         'round.enabled': 0,
  //         'round.pollIds': 0,
  //         'round.startedAt': 0,
  //         'round.endedAt': 0,
  //         'round.createdAt': 0,
  //         'round.updatedAt': 0,
  //         'round.__v': 0,
  //         userrounds: 0,
  //       },
  //     },
  //   ]);

  //   let rounds = await this.pollsService.findAllActiveEventRound();

  //   for (let user of users) {
  //     for (let i = 0; i < rounds.eventRound.length; i++) {
  //       if (user.round) {
  //         if (user.round.index == rounds.eventRound[i].index) {
  //           if (i == 0) {
  //           } else {
  //             user.round.title = rounds.eventRound[i - 1].title;
  //           }
  //         }
  //       } else {
  //         user['round'] = {
  //           title: rounds.eventRound[rounds.eventRound.length - 1].title,
  //         };
  //         break;
  //       }
  //     }

  //     if (user.round.title) {
  //     } else {
  //       for (let i = 0; i < rounds.normalRound.length; i++) {
  //         if (user.round.index) {
  //           if (user.round.index == rounds.eventRound[i].index) {
  //             if (i == rounds.normalRound.length - 1) {
  //               user.round.title = rounds.normalRound[0].title;
  //             } else {
  //               user.round.title = rounds.normalRound[i + 1].title;
  //             }
  //           }
  //         } else {
  //           user['round'] = {
  //             title: rounds.eventRound[rounds.eventRound.length - 1].title,
  //           };
  //           break;
  //         }
  //       }
  //     }
  //   }

  //   return users;
  // }

  async sendInboxPull(
    pollingId: string | mongoose.Types.ObjectId,
    pollId: string | mongoose.Types.ObjectId,
    profileId: string | mongoose.Types.ObjectId,
  ) {
    const profile = await this.profilesService.getById(profileId);
    if (profile.ownerId) {
      const userConfig = await this.getNotificationUserConfig(profile.ownerId);
      if (userConfig && userConfig.fcmToken && userConfig.receivePull) {
        const poll = await this.pollsService.findPollById(pollId);
        this.firebaseService.sendPush({
          tokens: [userConfig.fcmToken],
          title: '누군가가 ' + profile.name + '님을 투표했어요!',
          // 알림 문자는 한줄로
          message: poll.contentText.split('\n').join(' '),
          payload: {
            action: 'pull',
            value: pollingId,
          },
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
