import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { Gender } from 'src/profiles/enums';
import { UserDto } from './dtos';
import { User, UserDocument } from './schemas/user.schema';
import * as dayjs from 'dayjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent, UserDeletedEvent } from './events';
import {
  SCHOOL_SCHEMA_NAME,
  USER_SCHOOL_SCHEMA_NAME,
} from 'src/schools/schools.constants';
import { PROFILE_SCHEMA_NAME } from 'src/profiles/profiles.constant';
import { GetRecommendationDto, RecommendationDto } from './dtos/list.dto';
import {
  FriendShipDocument,
  Friendship,
} from 'src/friendships/schemas/friendships.schema';
import { FILE_SCHEMA_NAME } from 'src/files/files.constant';
import { UtilsService } from 'src/common/providers';
import { PagingResDto } from 'src/common/dtos';
import { Profile, ProfileDocument } from 'src/profiles/schemas/profile.schema';
import { USER_SCHEMA_NAME } from './users.constant';
import { WrappedError } from 'src/common/errors';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
    @InjectModel(Friendship.name)
    private friendshipModel: Model<FriendShipDocument>,
    private eventEmitter: EventEmitter2,
    private utilsService: UtilsService,
  ) {}

  async getReferralLengthByPhone(phoneNumber: string) {
    const user = await this.userModel.findOne({
      phoneNumber,
      isDeleted: { $ne: true },
    });

    if (!user) {
      throw new WrappedError(USER_SCHEMA_NAME).notFound();
    }

    return await this.userModel
      .findOne({
        referralUserId: user._id,
      })
      .count();
  }

  async listRecommendation(
    userId: string | Types.ObjectId,
    query: GetRecommendationDto,
  ): Promise<PagingResDto<RecommendationDto>> {
    const friendship = await this.friendshipModel.findOne(
      {
        userId: new Types.ObjectId(userId),
      },
      {
        friends: {
          profileId: 1,
        },
      },
    );

    const schoolPipeline: PipelineStage[] = [
      // 학교 등록한 회원
      {
        $lookup: {
          from: USER_SCHOOL_SCHEMA_NAME,
          let: { userId: '$_id' },
          pipeline: [
            // 현재 등록된 학교만
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ['$disabled', true] },
                    { $eq: ['$userId', '$$userId'] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: SCHOOL_SCHEMA_NAME,
                localField: 'code',
                foreignField: 'code',
                as: 'school',
              },
            },
            { $unwind: { path: '$school' } },
          ],
          as: 'us',
        },
      },
      { $unwind: { path: '$us' } },
      // 같은 학교 필터링
      {
        $match: {
          'us.code': query.schoolCode,
        },
      },
    ];

    const cursor = await this.userModel.aggregate([
      // 탈퇴하지 않은 회원
      {
        $match: {
          isDeleted: { $ne: true },
          // 내가 아닌
          _id: { $ne: new Types.ObjectId(userId) },
        },
      },
      ...schoolPipeline,
      {
        $lookup: {
          from: PROFILE_SCHEMA_NAME,
          localField: '_id',
          foreignField: 'ownerId',
          as: 'profile',
        },
      },
      { $unwind: { path: '$profile' } },
      {
        $match: {
          'profile._id': { $nin: friendship.friends.map((x) => x.profileId) },
          'profile.name': { $regex: query.keyword || '', $options: 'i' },
        },
      },
      {
        $lookup: {
          from: FILE_SCHEMA_NAME,
          localField: 'profile.imageFileId',
          foreignField: '_id',
          as: 'file',
        },
      },
      { $unwind: { path: '$file', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          school: {
            name: '$us.school.name',
            grade: '$us.grade',
          },
          userId: '$_id',
          profileId: '$profile._id',
          name: '$profile.name',
          gender: '$profile.gender',
          profileImageKey: '$file.key',
          _id: 0,
        },
      },
      { $sort: { name: 1 } },
      this.utilsService.getCommonMongooseFacet({
        page: query.page,
        limit: query.limit,
      }),
    ]);

    const metdata = cursor[0].metadata;
    const data = cursor[0].data;
    return {
      total: metdata[0]?.total || 0,
      data: data,
    };
  }

  // 전화번호 리스트로 요청시 가입 여부와 친구 여부 response
  async listRecommendationByPhoneNumbers(
    userId: string | Types.ObjectId,
    phoneNumbers: string[],
  ): Promise<PagingResDto<RecommendationDto>> {
    const friendship = await this.friendshipModel.findOne(
      {
        userId: new Types.ObjectId(userId),
      },
      {
        friends: {
          profileId: 1,
        },
      },
    );

    const cursor = await this.profileModel.aggregate<RecommendationDto>([
      // 요청 전화번호로 가입한 회원만
      {
        $match: {
          phoneNumber: { $in: phoneNumbers },
        },
      },
      {
        $lookup: {
          from: USER_SCHEMA_NAME,
          localField: 'ownerId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          // 탈퇴하지 않은 회원
          'user.isDeleted': { $ne: true },
          // 내가 아닌
          'user._id': { $ne: new Types.ObjectId(userId) },
        },
      },
      {
        $lookup: {
          from: FILE_SCHEMA_NAME,
          localField: 'imageFileId',
          foreignField: '_id',
          as: 'file',
        },
      },
      { $unwind: { path: '$file', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          phoneNumber: 1,
          userId: '$user._id',
          profileId: '$_id',
          name: '$name',
          gender: '$gender',
          profileImageKey: '$file.key',
          _id: 0,
        },
      },
      { $sort: { name: 1 } },
    ]);

    const results = cursor.map((z) => {
      // 친구라면
      if (
        friendship.friends.findIndex((x) => x.profileId.equals(z.profileId)) >=
        0
      ) {
        z.isFriend = true;
      }
      return z;
    });

    return {
      total: results.length,
      data: results,
    };
  }

  async findActiveUserOne(filter: FilterQuery<User>): Promise<User | null> {
    const user = await this.userModel.findOne({
      ...filter,
      isDeleted: { $ne: true },
    });

    if (!user) {
      return null;
    }

    return user.toObject();
  }

  async findActiveUserById(id: string | Types.ObjectId): Promise<User | null> {
    const user = await this.userModel.findById(id);
    if (!user || user.isDeleted) {
      return null;
    }

    return user.toObject();
  }

  async updateRefreshTokenById(
    id: string | Types.ObjectId,
    refreshToken: string,
  ) {
    await this.userModel.findByIdAndUpdate(id, {
      $set: {
        refreshToken,
      },
    });
  }

  // 호출전에 phoneNumber 존재여부 확인
  async create(
    phoneNumber: string,
    name: string,
    gender: Gender,
    schoolCode?: string,
    schoolGrade?: number,
    schoolRoom?: number,
    referralUserId?: string,
  ): Promise<string> {
    const user = await new this.userModel({
      phoneNumber,
      referralUserId: referralUserId
        ? new Types.ObjectId(referralUserId)
        : undefined,
    }).save();

    this.eventEmitter.emit(
      UserCreatedEvent.name,
      new UserCreatedEvent(
        user._id,
        name,
        phoneNumber,
        gender,
        schoolCode,
        schoolGrade,
        schoolRoom,
      ),
    );

    return user._id.toHexString();
  }

  // 탈퇴전 userId 검증은 호출하는 함수에서 선행 필요
  async deleteUser(
    userId: string | Types.ObjectId,
    deletionReason: string,
  ): Promise<void> {
    const user = await this.userModel.findByIdAndUpdate(userId, {
      $set: {
        deletedAt: dayjs().toDate(),
        isDeleted: true,
        deletionReason,
        refreshToken: undefined,
      },
    });

    this.eventEmitter.emit(
      UserDeletedEvent.name,
      new UserDeletedEvent(user._id),
    );
  }

  async _userDocToDto(user: User): Promise<UserDto> {
    const dto = new UserDto();
    dto.id = user._id.toHexString();
    dto.phoneNumber = user.phoneNumber;
    return dto;
  }
}
