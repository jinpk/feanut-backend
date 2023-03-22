import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, ProjectionFields, FilterQuery } from 'mongoose';
import { Gender } from './enums';
import { ProfileCreatedEvent } from './events';
import { Profile, ProfileDocument } from './schemas/profile.schema';
import { Polling, PollingDocument } from '../pollings/schemas/polling.schema';
import { FeanutCardDto } from './dtos';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
    @InjectModel(Polling.name) private pollingModel: Model<PollingDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  /*
  async createWithKakaoProfile(
    kakaoUserId: string,
    name: string,
    gender?: Gender,
    birth?: string,
    profileImageURL?: string,
    thumbnailURL?: string,
  ): Promise<string> {
    const doc = await new this.profileModel({
      kakaoUserId,
      name,
      gender,
      birth,
      profileImageURL,
      thumbnailURL,
    }).save();
    const id = doc._id.toHexString();

    this.eventEmitter.emit(
      ProfileCreatedEvent.name,
      new ProfileCreatedEvent(id),
    );

    return id;
  }

  async updateByKakaoUserId(
    kakaoUserId: string,
    name?: string,
    gender?: Gender,
    birth?: string,
    profileImageURL?: string,
    thumbnailURL?: string,
  ) {
    const doc = await this.profileModel.findOne({ kakaoUserId });

    if (name) {
      doc.name = name;
    }
    if (gender) {
      doc.gender = gender;
    }
    if (birth) {
      doc.birth = birth;
    }
    if (profileImageURL) {
      doc.profileImageURL = profileImageURL;
    }
    if (thumbnailURL) {
      doc.thumbnailURL = thumbnailURL;
    }

    await doc.save();
  }*/

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
}
