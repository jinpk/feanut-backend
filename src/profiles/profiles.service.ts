import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, FilterQuery, Types } from 'mongoose';
import { Gender } from './enums';
import { Profile, ProfileDocument } from './schemas/profile.schema';
import { Polling, PollingDocument } from '../pollings/schemas/polling.schema';
import { FeanutCardDto, ProfileDto, UpdateProfileDto } from './dtos';
import { FilesService } from 'src/files/files.service';

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

  async create(
    ownerId: Types.ObjectId,
    name?: string,
    gender?: Gender,
    birth?: string,
  ): Promise<string> {
    const doc = await new this.profileModel({
      ownerId,
      name,
      gender,
      birth,
    }).save();
    const id = doc._id.toHexString();

    return id;
  }

  async updateById(id: string | Types.ObjectId, dto: UpdateProfileDto) {
    const profile = await this.profileModel.findById(id);

    if (dto.imageFileId !== undefined) {
      profile.imageFileId = dto.imageFileId
        ? new Types.ObjectId(dto.imageFileId)
        : null;
    }

    if (dto.name) {
      profile.name = dto.name;
    }

    if (dto.statusMessage !== undefined) {
      profile.statusMessage = dto.statusMessage;
    }

    await profile.save();

    // 파일 업로드 완료 상태 변경
    if (dto.imageFileId) {
      await this.filesService.updateUploadedState(dto.imageFileId);
    }
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

  docToDto(doc: Profile | ProfileDocument): ProfileDto {
    const dto = new ProfileDto();
    dto.birth = doc.birth || null;
    dto.gender = doc.gender || null;
    dto.name = doc.name || '';
    dto.statusMessage = doc.statusMessage || '';
    return dto;
  }
}
