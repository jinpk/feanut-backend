import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { ProfilesService } from 'src/profiles/profiles.service';
import { CoinDto } from './dtos';
import { Coin, CoinDocument } from './schemas/coin.schema';
import { BuyCoin, BuyCoinDocument } from './schemas/buycoin.schema';
import { UseCoin, UseCoinDocument } from './schemas/usecoin.schema';

@Injectable()
export class CoinsService {
  constructor(
    @InjectModel(Coin.name) private coinModel: Model<CoinDocument>,
    private profilesService: ProfilesService,
  ) {}

  async findCoinOne(
    filter: FilterQuery<CoinDocument>,
  ): Promise<Coin | null> {
    const user = await this.coinModel.findOne({
      ...filter,
      isDeleted: false,
    });

    if (!user) {
      return null;
    }

    return user.toObject();
  }

  // async findActiveUserById(id: string): Promise<Vote | null> {
  //   const user = await this.voteModel.findById(id);
  //   if (!user || vote.isDeleted) {
  //     return null;
  //   }

  //   return user.toObject();
  // }

  // async createUserWithEmail(email: string): Promise<string> {
  //   const user = await new this.voteModel({ email }).save();

  //   // 프로필 생성
  //   try {
  //     const profileId = await this.profilesService.createEmptyProfile();
  //     user.profileId = new Types.ObjectId(profileId);
  //     await user.save();
  //   } catch (error) {
  //     user.delete();
  //   }

  //   return user._id.toHexString();
  // }

  // async _voteToDto(vote: VoteDocument | Vote): Promise<VoteDto> {
  //   const dto = new VoteDto();
  //   dto.id = vote.id;
  //   dto.profileId = vote.profileId.toHexString();
  //   return dto;
  // }
}
