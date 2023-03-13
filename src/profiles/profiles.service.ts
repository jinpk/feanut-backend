import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InsertKakaoProfileDto } from './dtos/kakao.dto';
import { Profile, ProfileDocument } from './schemas/profile.schema';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
  ) {}

  async createEmptyProfile() {
    const doc = await new this.profileModel({}).save();
    return doc._id.toHexString();
  }

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
      serviceCode: dto.uuid,
    }).save();

    return doc._id.toHexString();
  }

  /*
  async patchUser(id: string, dto: PatchUserDto) {
    const user = await this.userModel.findById(id);
    if (!user || user.isDeleted) {
      throw new NotFoundException();
    }

    if (dto.birth) {
      user.birth = dto.birth;
    }

    if (dto.gender) {
      user.gender = dto.gender;
    }

    if (dto.name) {
      user.name = dto.name;
    }

    if (typeof dto.profileImageId === 'string') {
      user.profileImageId = dto.profileImageId
        ? new Types.ObjectId(dto.profileImageId)
        : null;
    }

    await user.save();

    this.eventEmitter.emit(
      UserPatchedEvent.name,
      new UserPatchedEvent(id, dto),
    );
  }*/
}
