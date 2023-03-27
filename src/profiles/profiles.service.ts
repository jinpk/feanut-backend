import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, FilterQuery, Types, ObjectId } from 'mongoose';
import { Gender } from './enums';
import { Profile, ProfileDocument } from './schemas/profile.schema';
import { Polling, PollingDocument } from '../pollings/schemas/polling.schema';
import { FeanutCardDto, ProfileDto, UpdateProfileDto } from './dtos';
import { FilesService } from 'src/files/files.service';
import { WrappedError } from 'src/common/errors';
import { PROFILE_MODULE_NAME, PROFILE_SCHEMA_NAME } from './profiles.constant';
import { USER_SCHEMA_NAME } from 'src/users/users.constant';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
    @InjectModel(Polling.name) private pollingModel: Model<PollingDocument>,
    private filesService: FilesService,
  ) {}

  // 소유권지정
  async makeOwnerShipById(
    profileId: Types.ObjectId,
    ownerId: Types.ObjectId,
    name?: string,
    gender?: Gender,
    birth?: string,
  ) {
    await this.profileModel.findByIdAndUpdate(profileId, {
      $set: { ownerId, name: name || '', gender, birth },
    });
  }

  // 휴대폰번호로 프로필 ID 조회
  // 이미 탈퇴한 사용자도 필터링
  async getIdByPhoneNumber(
    phoneNumber: string,
  ): Promise<Types.ObjectId | null> {
    const profiles = await this.profileModel.aggregate<ProfileDocument>([
      {
        $match: {
          phoneNumber,
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
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          'user.isDeleted': {
            $ne: true,
          },
        },
      },
    ]);

    if (profiles.length) {
      return profiles[0]._id;
    } else {
      return null;
    }
  }

  // 아직 소유권없는 프로필 조회
  async getOwnerLessProfileByPhoneNumber(
    phoneNumber: string,
  ): Promise<Types.ObjectId | null> {
    const profile = await this.profileModel.findOne({
      phoneNumber,
      ownerId: { $exists: false },
    });
    if (profile) {
      return profile._id;
    }

    return null;
  }

  async createWithPhoneNumber(phoneNumber: string): Promise<Types.ObjectId> {
    const doc = await new this.profileModel({
      phoneNumber,
    }).save();

    return doc._id;
  }

  async create(
    ownerId: Types.ObjectId,
    phoneNumber: string,
    name?: string,
    gender?: Gender,
    birth?: string,
  ): Promise<string> {
    const doc = await new this.profileModel({
      ownerId,
      name,
      gender,
      birth,
      phoneNumber,
    }).save();
    const id = doc._id.toHexString();

    return id;
  }

  async updateInstagramById(id: string | Types.ObjectId, instagram: string) {
    const profile = await this.profileModel.findById(id);

    profile.instagram = instagram;
    await profile.save();
  }

  async updateById(id: string | Types.ObjectId, dto: UpdateProfileDto) {
    if (!Object.keys(dto).length) {
      throw new WrappedError(
        PROFILE_SCHEMA_NAME,
        null,
        'zero properties to update',
      ).badRequest();
    }
    const profile = await this.profileModel.findById(id);

    if (dto.name) {
      profile.name = dto.name;
    }

    if (dto.statusMessage !== undefined) {
      profile.statusMessage = dto.statusMessage;
    }

    if (dto.instagram !== undefined && !dto.instagram) {
      profile.instagram = undefined;
    }

    if (dto.imageFileId !== undefined) {
      if (dto.imageFileId) {
        if (!(await this.filesService.hasById(dto.imageFileId))) {
          throw new WrappedError(
            PROFILE_MODULE_NAME,
            null,
            'non-exist imageFileId',
          ).badRequest();
        } else {
          profile.imageFileId = new Types.ObjectId(dto.imageFileId);
        }
      } else {
        profile.imageFileId = null;
      }
    }

    await profile.save();

    // 파일 업로드 완료 상태 변경
    if (dto.imageFileId) {
      await this.filesService.updateUploadedState(dto.imageFileId);
    }
  }

  async getById(id: string | Types.ObjectId): Promise<Profile | null> {
    const profile = await this.profileModel.findById(id);
    if (!profile) return null;
    return profile.toObject();
  }

  async getByUserId(userId: string | Types.ObjectId): Promise<Profile | null> {
    const profile = await this.profileModel.findOne({
      ownerId: new Types.ObjectId(userId),
    });

    if (!profile) return null;

    return profile.toObject();
  }

  async findMyFeanutCard(
    user_id: string,
    profile_id: Object,
  ): Promise<FeanutCardDto> {
    var myCard = new FeanutCardDto();
    myCard = {
      joy: 0,
      gratitude: 0,
      serenity: 0,
      interest: 0,
      hope: 0,
      pride: 0,
      amusement: 0,
      inspiration: 0,
      awe: 0,
      love: 0,
    };

    const filter: FilterQuery<PollingDocument> = {
      selectedProfileId: profile_id,
    };

    const lookups: PipelineStage[] = [
      {
        $lookup: {
          from: 'polls',
          localField: 'pollsId',
          foreignField: '_id',
          as: 'polls',
        },
      },
      {
        $unwind: {
          path: '$polls',
          preserveNullAndEmptyArrays: false,
        },
      },
    ];

    const projection = {
      _id: 1,
      pollIds: 1,
      emotion: '$polls.emotion',
      selectedAt: 1,
      createdAt: 1,
    };

    const cursor = await this.pollingModel.aggregate([
      { $match: filter },
      ...lookups,
      { $project: projection },
      // this.utilsService.getCommonMongooseFacet(query),
    ]);

    if (cursor[0]) {
      const data = cursor[0].data;

      data.array.forEach((element) => {
        if (element.emotion == 'joy') {
          myCard.joy += 1;
        }
      });
    }

    return myCard;
  }

  async getProfileImageKey(imageFileId: Types.ObjectId) {
    return await this.filesService.getKeyById(imageFileId);
  }

  docToDto(doc: Profile | ProfileDocument): ProfileDto {
    const dto = new ProfileDto();
    dto.id = doc._id.toHexString();
    dto.birth = doc.birth || null;
    dto.gender = doc.gender || null;
    dto.name = doc.name || '';
    dto.statusMessage = doc.statusMessage || '';
    dto.instagram = doc.instagram || '';
    dto.ownerId = doc.ownerId?.toHexString() || '';
    return dto;
  }
}
