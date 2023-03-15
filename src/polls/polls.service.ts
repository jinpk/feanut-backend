import { Injectable, Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  now,
  FilterQuery,
  Model,
  PipelineStage,
  ProjectionFields,
  Types,
} from 'mongoose';
import { PollDto } from './dtos/poll.dto';
import { Poll, PollDocument } from './schemas/poll.schema';
import { UpdatePollDto } from './dtos/update-poll.dto';
import { ProfilesService } from 'src/profiles/profiles.service';

@Injectable()
export class PollsService {
  constructor(
    @InjectModel(Poll.name) private pollModel: Model<PollDocument>,
    private profilesService: ProfilesService,
  ) {}

  create(createPollDto: PollDto) {
    return 'This action adds a new poll';
  }

  findAll() {
    return `This action returns all polls`;
  }

  async findOne(
    filter: FilterQuery<PollDocument>,
  ): Promise<Poll | null> {
    const user = await this.pollModel.findOne({
      ...filter,
      isDeleted: false,
    });

    if (!user) {
      return null;
    }

    return user.toObject();
  }

  update(id: number, updatePollDto: UpdatePollDto) {
    return `This action updates a #${id} poll`;
  }

  remove(id: number) {
    return `This action removes a #${id} poll`;
  }
}
