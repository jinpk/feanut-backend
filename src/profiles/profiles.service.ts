import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gender } from './enums';
import { ProfileCreatedEvent } from './events';
import { Profile, ProfileDocument } from './schemas/profile.schema';
import { FilesService } from '../files/files.service';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
    private eventEmitter: EventEmitter2,
    private filesService: FilesService,
  ) {}

  async createEmptyProfile() {
    throw new Error("Method not implemented.");
    return ""
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
  }

  async getByKakaoUserId(kakaoUserId: string): Promise<Profile | null> {
    const doc = await this.profileModel.findOne({ kakaoUserId });

    return doc;
  }
}
