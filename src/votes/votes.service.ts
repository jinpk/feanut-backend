import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { ProfilesService } from 'src/profiles/profiles.service';
import { VoteDto } from './dtos';
import { Vote, VoteDocument } from './schemas/vote.schema';

@Injectable()
export class VotesService {
  constructor(
    @InjectModel(Vote.name) private voteModel: Model<VoteDocument>,
    private profilesService: ProfilesService,
  ) {}

  async findActiveUserOne(
    filter: FilterQuery<VoteDocument>,
  ): Promise<User | null> {
    const user = await this.voteModel.findOne({
      ...filter,
      isDeleted: false,
    });

    if (!user) {
      return null;
    }

    return user.toObject();
  }

  async findActiveUserById(id: string): Promise<User | null> {
    const user = await this.voteModel.findById(id);
    if (!user || user.isDeleted) {
      return null;
    }

    return user.toObject();
  }

  async createUserWithEmail(email: string): Promise<string> {
    const user = await new this.voteModel({ email }).save();

    // 프로필 생성
    try {
      const profileId = await this.profilesService.createEmptyProfile();
      user.profileId = new Types.ObjectId(profileId);
      await user.save();
    } catch (error) {
      user.delete();
    }

    return user._id.toHexString();
  }

  async _userToDto(vote: VoteDocument | Vote): Promise<VoteDto> {
    const dto = new VoteDto();
    dto.id = vote.id;
    dto.profileId = vote.profileId.toHexString();
    dto.email = vote.email;
    return dto;
  }
}
