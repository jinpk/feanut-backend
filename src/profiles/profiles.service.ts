import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InsertKakaoProfileDto } from './dtos/kakao.dto';
import { ProfileCreatedEvent } from './events';
import { Profile, ProfileDocument } from './schemas/profile.schema';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async deleteProfile(profileId: string) {
    await this.profileModel.findByIdAndDelete(profileId);
  }

  async createEmptyProfile() {
    const doc = await new this.profileModel({}).save();
    const id = doc._id.toHexString();

    this.eventEmitter.emit(
      ProfileCreatedEvent.name,
      new ProfileCreatedEvent(id),
    );

    return id;
  }

  async hasByKakaoUserId(kakaoUserId: string): Promise<boolean> {
    const doc = await this.profileModel.findOne({
      kakaoUserId,
    });

    if (!doc) {
      return false;
    }

    return false;
  }

  async createProfileWithKakaoUserId(kakaoUserId: string): Promise<string> {
    const doc = await new this.profileModel({ kakaoUserId }).save();
    const id = doc._id.toHexString();

    this.eventEmitter.emit(
      ProfileCreatedEvent.name,
      new ProfileCreatedEvent(id),
    );

    return id;
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
