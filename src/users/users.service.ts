import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery,
  Model,
  PipelineStage,
  ProjectionFields,
  Types,
} from 'mongoose';
import { UserDto, FeanutCardDto } from './dtos';
import { User, UserDocument } from './schemas/user.schema';
import { Polling, PollingDocument } from '../pollings/schemas/polling.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(User.name) private pollingModel: Model<PollingDocument>,
  ) {}

  async findActiveUserOne(filter: FilterQuery<User>): Promise<User | null> {
    const user = await this.userModel.findOne({
      ...filter,
      isDeleted: false,
    });

    if (!user) {
      return null;
    }
    return user.toObject();
  }

  async findActiveUserById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id);
    if (!user || user.isDeleted) {
      return null;
    }

    return user.toObject();
  }

  async createUserWithEmail(email: string): Promise<string> {
    const user = await new this.userModel({ email }).save();
    return user._id.toHexString();
  }

  async createUserWithKakao(kakaoId: string, email = ''): Promise<string> {
    const user = await new this.userModel({ email, kakaoId }).save();
    return user._id.toHexString();
  }

  async updateKakaoId(
    id: string | Types.ObjectId,
    kakaoId: string,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { $set: { kakaoId } });
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

  async _userDocToDto(user: User): Promise<UserDto> {
    const dto = new UserDto();
    dto.id = user._id.toHexString();
    dto.profileId = user.profileId?.toHexString();
    dto.email = user.email;
    return dto;
  }
}
