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
import { UpdatePollDto, UpdateRoundDto, UpdatePollIdsDto } from './dtos/update-poll.dto';
import { GetListPollDto, GetListRoundDto } from './dtos/get-poll.dto'
// import { UtilsService } from 'src/common/providers';

@Injectable()
export class PollsService {
  constructor(
    @InjectModel(Poll.name) private pollModel: Model<PollDocument>,
    @InjectModel(Round.name) private roundModel: Model<RoundDocument>,
    private profilesService: ProfilesService,
  ) {}

  async createPoll(body: PollDto): Promise<string> {
    const result = await new this.pollModel(body).save()
    return result._id.toString()
  }

  async createRound(body: RoundDto): Promise<string> {
    const result = await new this.roundModel(body).save()
    return result._id.toString()
  }

  async updatePoll(poll_id: string, body) {
    const result = await this.pollModel.findByIdAndUpdate( poll_id, { 
      $set: {body, updatedAt: now()}
    });
    return result._id.toString()
  }

  async updateRound(round_id: string, body: UpdateRoundDto) {
    const result = await this.roundModel.findByIdAndUpdate( round_id, { 
      $set: {body, updatedAt: now()}
    });
    return result._id.toString()
  }

  async updatePollIds(round_id: string, body: UpdatePollIdsDto) {
    const round = await this.roundModel.findOne({round_id})
    const newIds = round.pollIds.concat(body.pollIds)
    
    const result = await this.roundModel.findByIdAndUpdate( round_id, { 
      $set: {pollIds: newIds, updatedAt: now()}
    });
    return result._id.toString()
  }

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

  async findRoundOne() {

  }

  async findPollOne() {

  }
}
