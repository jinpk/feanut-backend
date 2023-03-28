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
import { RoundDto, ResRoundDto } from './dtos/round.dto';
import { Poll, PollDocument } from './schemas/poll.schema';
import { Round, RoundDocument } from './schemas/round.schema';
import {
  UpdatePollDto,
  UpdateRoundDto,
  UpdatePollIdsDto,
} from './dtos/update-poll.dto';
import { GetListPollDto, GetListRoundDto } from './dtos/get-poll.dto';
import { UtilsService } from 'src/common/providers';
import { KR_TIME_DIFF } from 'src/common/common.constant';
import { WrappedError } from 'src/common/errors';
import {
  PollRoundEvent,
  PollRoundEventDocument,
} from './schemas/round-\bevent.schema';

@Injectable()
export class PollsService {
  constructor(
    @InjectModel(Poll.name) private pollModel: Model<PollDocument>,
    @InjectModel(Round.name) private roundModel: Model<RoundDocument>,
    @InjectModel(PollRoundEvent.name)
    private pollRoundEventModel: Model<PollRoundEventDocument>,
    private utilsService: UtilsService,
  ) {}

  async createPoll(body: PollDto): Promise<string> {
    const krtime = new Date(now().getTime() + KR_TIME_DIFF);
    body.createdAt = krtime;

    const result = await new this.pollModel(body).save();
    return result._id.toString();
  }

  async createRound(body: RoundDto): Promise<string> {
    // pollids가 12개 이하인지 확인
    if (body.pollIds.length < 12) {
      throw new WrappedError('투표를 12개 이상 선택해주세요.').reject();
    }

    if (body.eventRound) {
      if (!body.startedAt || !body.endedAt) {
        throw new WrappedError('시작일, 종료일을 입력해 주세요.').reject();
      }
    }

    const result = await new this.roundModel(body).save();
    return result._id.toString();
  }

  async updatePoll(poll_id: string, poll: Poll, body) {
    const krtime = new Date(now().getTime() + KR_TIME_DIFF);

    const result = await this.pollModel.findByIdAndUpdate(poll_id, {
      $set: {
        emotion: body.emotion,
        emojiId: body.emojiId,
        contentText: body.contentText,
        updatedAt: krtime,
      },
    });
    return result._id.toString();
  }

  async updateRound(round_id: string, round: Round, body: UpdateRoundDto) {
    const krtime = new Date(now().getTime() + KR_TIME_DIFF);

    // pollids가 12개 이하이면 우선 비활성화
    if (body.pollIds.length < 12) {
      body.enabled = false;
    }

    const result = await this.roundModel.findByIdAndUpdate(round_id, {
      $set: {
        enabled: body.enabled,
        pollIds: body.pollIds,
        startedAt: body.startedAt,
        endedAt: body.endedAt,
        updatedAt: krtime,
      },
    });
    return result._id.toString();
  }

  async existPoll(poll_id: string): Promise<[boolean, Poll]> {
    const poll = await this.pollModel.findOne({ poll_id });

    if (!poll) {
      return [false, poll];
    }
    return [true, poll];
  }

  async existRound(round_id: string): Promise<[boolean, Round]> {
    const round = await this.roundModel.findOne({ round_id });

    if (!round) {
      return [false, round];
    }
    return [true, round];
  }

  async findListRound(query: GetListRoundDto): Promise<PagingResDto<RoundDto>> {
    const filter: FilterQuery<RoundDocument> = {};

    const projection: ProjectionFields<RoundDto> = {
      _id: 1,
      enabled: 1,
      pollIds: 1,
      startedAt: 1,
      endedAt: 1,
      createdAt: 1,
    };

    const cursor = await this.roundModel.aggregate([
      { $match: filter },
      { $project: projection },
      { $sort: { createdAt: -1 } },
      this.utilsService.getCommonMongooseFacet(query),
    ]);

    const metdata = cursor[0].metadata;
    const data = cursor[0].data;

    return {
      total: metdata[0]?.total || 0,
      data: data,
    };
  }

  async findListPoll(query: GetListPollDto): Promise<PagingResDto<PollDto>> {
    const filter: FilterQuery<PollDocument> = {};

    const projection: ProjectionFields<PollDto> = {
      _id: 1,
      emotion: 1,
      emoji: 1,
      contentText: 1,
      createdAt: 1,
    };

    const cursor = await this.pollModel.aggregate([
      { $match: filter },
      { $project: projection },
      { $sort: { createdAt: -1 } },
      this.utilsService.getCommonMongooseFacet(query),
    ]);

    const metdata = cursor[0].metadata;
    const data = cursor[0].data;

    return {
      total: metdata[0]?.total || 0,
      data: data,
    };
  }

  async findRoundById(round_id: string) {
    const result = await this.roundModel.findById(round_id);
    return result;
  }

  async findPollById(poll_id) {
    const result = await this.pollModel.findById(poll_id);
    return result;
  }

  async findListPublicPoll(query): Promise<PagingResDto<PollDto>> {
    const filter: FilterQuery<PollDocument> = {};

    const projection: ProjectionFields<PollDto> = {
      _id: 1,
      emotion: 1,
      emojiId: 1,
      isOpenedCount: 1,
      contentText: 1,
      createdAt: 1,
    };

    const cursor = await this.pollModel.aggregate([
      { $match: filter },
      { $project: projection },
      { $sort: { isOpenedCount: -1 } },
      this.utilsService.getCommonMongooseFacet(query),
    ]);

    const metdata = cursor[0].metadata;
    const data = cursor[0].data;

    return {
      total: metdata[0]?.total || 0,
      data: data,
    };
  }

  pollToDto(doc: Poll | PollDocument): PollDto {
    const dto = new PollDto();
    dto.id = doc._id.toHexString();
    dto.emotion = doc.emotion;
    dto.emojiId = doc.emojiId;
    dto.contentText = doc.contentText;
    return dto;
  }

  roundToDto(doc: Round | RoundDocument): ResRoundDto {
    const dto = new ResRoundDto();
    dto.id = doc._id.toHexString();
    dto.title = doc.title;
    dto.index = doc.index;
    dto.enabled = doc.enabled;
    dto.eventRound = doc.eventRound;
    dto.pollIds = doc.pollIds;
    dto.startedAt = doc.startedAt;
    dto.endedAt = doc.endedAt;
    return dto;
  }
}