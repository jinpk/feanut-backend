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
import { PagingResDto } from 'src/common/dtos';
import { ProfilesService } from 'src/profiles/profiles.service';
import { PollDto } from './dtos/poll.dto';
import { RoundDto } from './dtos/round.dto';
import { Poll, PollDocument } from './schemas/poll.schema';
import { Round, RoundDocument } from './schemas/round.schema';
import { UpdatePollDto } from './dtos/update-poll.dto';
import { GetListPollDto, GetListRoundDto } from './dtos/get-poll.dto'
// import { UtilsService } from 'src/common/providers';

@Injectable()
export class PollsService {
  constructor(
    @InjectModel(Poll.name) private pollModel: Model<PollDocument>,
    @InjectModel(Round.name) private roundModel: Model<RoundDocument>,
    private profilesService: ProfilesService,
  ) {}

  async findListRound(query:GetListRoundDto): Promise<PagingResDto<RoundDto>> {
    var filter: FilterQuery<RoundDocument> = {}

    const projection: ProjectionFields<RoundDto> = {
      _id: 1,
      userId: 1,
      useType: 1,
      createdAt: 1,
    };

    const cursor = await this.roundModel.aggregate([
      { $match: filter },
      { $project: projection },
      { $sort: { createdAt: -1 } },
      // this.utilsService.getCommonMongooseFacet(query),
    ]);

    const metdata = cursor[0].metadata;
    const data = cursor[0].data;

    return {
      total: metdata[0]?.total || 0,
      data: data,
    };
  }

  async findListPoll(query:GetListPollDto): Promise<PagingResDto<PollDto>> {
    var filter: FilterQuery<PollDocument> = {}

    const projection: ProjectionFields<PollDto> = {
      _id: 1,
      userId: 1,
      useType: 1,
      createdAt: 1,
    };

    const cursor = await this.pollModel.aggregate([
      { $match: filter },
      { $project: projection },
      { $sort: { createdAt: -1 } },
      // this.utilsService.getCommonMongooseFacet(query),
    ]);

    const metdata = cursor[0].metadata;
    const data = cursor[0].data;

    return {
      total: metdata[0]?.total || 0,
      data: data,
    };
  }
}
