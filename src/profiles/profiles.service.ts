import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InsertKakaoProfileDto } from './dtos/kakao.dto';
import { ProfileService } from './enums';
import { Profile, ProfileDocument } from './schemas/profile.schema';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
  ) {}

  async hasKakaoProfileById(kakaoUserId: bigint): Promise<boolean> {
    const doc = await this.profileModel.findOne({
      serviceUserId: kakaoUserId.toString(),
    });
    if (doc) {
      return true;
    }

    return false;
  }

  async insertKakaoProfile(dto: InsertKakaoProfileDto): Promise<string> {
    const doc = await new this.profileModel({
      nickname: dto.nickname,
      profileThumbnailUrl: dto.profileThumbnailUrl,
      serviceUserId: dto.id.toString(),
      service: ProfileService.Kakao,
      serviceCode: dto.uuid,
    }).save();

    return doc._id.toHexString();
  }
}
