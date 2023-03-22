import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, FilterQuery, Types } from 'mongoose';
import { Gender } from './enums';
import { Profile, ProfileDocument } from './schemas/profile.schema';
import { Polling, PollingDocument } from '../pollings/schemas/polling.schema';
import { FeanutCardDto, ProfileDto, UpdateProfileDto } from './dtos';
import { FilesService } from 'src/files/files.service';
import { WrappedError } from 'src/common/errors';
import { PROFILE_MODULE_NAME } from './profiles.constant';

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
  async getIdByPhoneNumber(
    phoneNumber: string,
  ): Promise<Types.ObjectId | null> {
    const profile = await this.profileModel.findOne({
      phoneNumber,
    });
    if (profile) {
      return profile._id;
    }

    return null;
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

  async updateById(id: string | Types.ObjectId, dto: UpdateProfileDto) {
    const profile = await this.profileModel.findById(id);

    if (dto.name) {
      profile.name = dto.name;
    }

    if (dto.statusMessage !== undefined) {
      profile.statusMessage = dto.statusMessage;
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

  async findMyFeanutCard(profile_id): Promise<FeanutCardDto> {
    // const myReceive = await this.pollingModel.find({profileId: profile_id})
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
      { $project: projection },
      // this.utilsService.getCommonMongooseFacet(query),
    ]);

    const data = cursor[0].data;

    const myCard = new FeanutCardDto();

    data.array.forEach((element) => {
      if (element.emotion == 'joy') {
        myCard.joy += 1;
      }
    });

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
    return dto;
  }
}
