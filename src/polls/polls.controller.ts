import {
  Controller,
  Get,
  Param,
  Delete,
  Patch,
  Put,
  Post,
  Query,
  NotFoundException,
  Body,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators';
import { PollsService } from './polls.service';
import { PollDto } from './dtos/poll.dto';
import { RoundDto, ResRoundDto } from './dtos/round.dto';
import {
  UpdatePollDto,
  UpdateRoundDto,
  UpdatePollIdsDto,
} from './dtos/update-poll.dto';
import {
  GetListRoundDto,
  GetListPollDto,
  GetListPublicPollDto,
} from './dtos/get-poll.dto';
import { Round } from './schemas/round.schema';
import { Poll } from './schemas/poll.schema';
import { ApiOkResponsePaginated } from 'src/common/decorators';
import { WrappedError } from 'src/common/errors';
import { PollRoundEventDto } from './dtos/round-event.dto';
import {
  POLL_MODULE_NAME,
  POLL_ERROR_NOT_FOUND_ROUND,
  POLL_ERROR_NOT_FOUND_POLL,
  POLL_ERROR_NOT_AN_ADMIN,
} from './polls.constant';

@ApiTags('Poll')
@Controller('polls')
@ApiBearerAuth()
export class PollsGetController {
  constructor(private readonly pollsService: PollsService) {}

  @Get(':pollId')
  @ApiOperation({
    summary: '등록된 투표 상세 조회',
  })
  @ApiOkResponse({
    status: 200,
    type: PollDto,
  })
  async getPollDetail(@Param('pollId') pollId: string, @Request() req) {
    const poll = await this.pollsService.findPollById(pollId);
    if (!poll) {
      throw new WrappedError(
        POLL_MODULE_NAME,
        POLL_ERROR_NOT_FOUND_POLL,
      ).notFound();
    }
    const dto = this.pollsService.pollToDto(poll);
    return dto;
  }
}

@ApiTags('Poll')
@Controller('polls')
@ApiBearerAuth()
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Post('pollroundevents')
  @ApiOperation({
    summary: '(ADMIN) New RoundEvent 등록',
    description: 'required: message, subMessage, emojiId',
  })
  @ApiOkResponse({
    status: 200,
    type: String,
  })
  async postPollRoundEvent(@Body() body: PollRoundEventDto, @Request() req) {
    if (!req.user.isAdmin) {
      throw new WrappedError(
        POLL_MODULE_NAME,
        POLL_ERROR_NOT_AN_ADMIN,
        'Not an Admin',
      );
    }
    return await this.pollsService.createPollRoundEvent(body);
  }

  @Post('rounds')
  @ApiOperation({
    summary: '(ADMIN) New 라운드 등록',
    description:
      'eventround로 등록하려면 날짜 required. startedAt, endedAt: YYYY-MM-DD 입력.\n\n시작날짜 00시00분, 종료날짜 00시00분 종료.\n\nendedAt이 없을 시 기본 1년',
  })
  @ApiOkResponse({
    status: 200,
    type: String,
  })
  async postRound(@Body() body: RoundDto, @Request() req) {
    if (!req.user.isAdmin) {
      throw new WrappedError(
        POLL_MODULE_NAME,
        POLL_ERROR_NOT_AN_ADMIN,
        'Not an Admin',
      );
    }
    return await this.pollsService.createRound(body);
  }

  @Post('')
  @ApiOperation({
    summary: '(ADMIN) New Poll 등록',
    description:
      'emojiId 컬럼: 특정 emoji를 등록하려면 emojiId 입력. default: null인 경우 emotion에 따라 랜덤',
  })
  @ApiBody({
    type: PollDto,
  })
  @ApiOkResponse({
    status: 200,
    type: String,
  })
  async postPoll(@Body() body, @Request() req) {
    if (!req.user.isAdmin) {
      throw new WrappedError(
        POLL_MODULE_NAME,
        POLL_ERROR_NOT_AN_ADMIN,
        'Not an Admin',
      );
    }
    return await this.pollsService.createPoll(body);
  }

  @Put('rounds/:roundId/update')
  @ApiOperation({
    summary: '(ADMIN) 라운드 수정',
  })
  @ApiBody({
    type: UpdateRoundDto,
  })
  @ApiOkResponse({
    status: 200,
    type: String,
  })
  async putRound(
    @Param('roundId') roundId: string,
    @Body() body,
    @Request() req,
  ) {
    if (!req.user.isAdmin) {
      throw new WrappedError(
        POLL_MODULE_NAME,
        POLL_ERROR_NOT_AN_ADMIN,
        'Not an Admin',
      );
    }

    const [exist, round] = await this.pollsService.existRound(roundId);
    if (!exist) {
      throw new NotFoundException('not found round');
    }

    return await this.pollsService.updateRound(roundId, round, body);
  }

  @Put(':pollId')
  @ApiOperation({
    summary: '(ADMIN) Poll 수정',
  })
  @ApiBody({
    type: UpdatePollDto,
  })
  @ApiOkResponse({
    status: 200,
    type: String,
  })
  async putPoll(@Param('pollId') pollId: string, @Body() body, @Request() req) {
    if (!req.user.isAdmin) {
      throw new WrappedError(
        POLL_MODULE_NAME,
        POLL_ERROR_NOT_AN_ADMIN,
        'Not an Admin',
      );
    }
    const [exist, poll] = await this.pollsService.existPoll(pollId);
    if (!exist) {
      throw new NotFoundException('not found poll');
    }

    return await this.pollsService.updatePoll(pollId, poll, body);
  }

  @Get('rounds')
  @ApiOperation({
    summary: '(ADMIN) 라운드 목록 조회',
  })
  @ApiOkResponsePaginated(Round)
  async getListRound(@Query() query: GetListRoundDto, @Request() req) {
    if (!req.user.isAdmin) {
      throw new WrappedError(
        POLL_MODULE_NAME,
        POLL_ERROR_NOT_AN_ADMIN,
        'Not an Admin',
      );
    }
    return await this.pollsService.findListRound(query);
  }

  @Get('')
  @ApiOperation({
    summary: '(ADMIN) 등록된 투표 목록 조회',
  })
  @ApiOkResponsePaginated(Poll)
  async getListPoll(@Query() query: GetListPollDto, @Request() req) {
    if (!req.user.isAdmin) {
      throw new WrappedError(
        POLL_MODULE_NAME,
        POLL_ERROR_NOT_AN_ADMIN,
        'Not an Admin',
      );
    }
    return await this.pollsService.findListPoll(query);
  }

  @Get('rounds/:roundId')
  @ApiOperation({
    summary: '(ADMIN) 등록된 라운드 상세 조회',
    description: 'userId 미입력 시 전체조회',
  })
  @ApiOkResponse({
    status: 200,
    type: ResRoundDto,
  })
  async getRoundDetail(@Param('roundId') roundId: string, @Request() req) {
    if (!req.user.isAdmin) {
      throw new WrappedError(
        POLL_MODULE_NAME,
        POLL_ERROR_NOT_AN_ADMIN,
        'Not an Admin',
      );
    }

    const round = await this.pollsService.findRoundById(roundId);
    if (!round) {
      throw new WrappedError(
        POLL_MODULE_NAME,
        POLL_ERROR_NOT_FOUND_ROUND,
        'Not Found Round',
      ).notFound();
    }

    const dto = this.pollsService.roundToDto(round);

    return dto;
  }

  @Get(':pollId')
  @ApiOperation({
    summary: '등록된 투표 상세 조회',
  })
  @ApiOkResponse({
    status: 200,
    type: PollDto,
  })
  async getPollDetail(@Param('pollId') pollId: string, @Request() req) {
    const poll = await this.pollsService.findPollById(pollId);
    if (!poll) {
      throw new WrappedError(
        POLL_MODULE_NAME,
        POLL_ERROR_NOT_FOUND_POLL,
      ).notFound();
    }
    const dto = this.pollsService.pollToDto(poll);
    return dto;
  }
}

@ApiTags('Poll')
@Controller('publicpolls')
export class PublicPollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Get('')
  @Public()
  @ApiOperation({
    summary: '(PUBLIC) 상위 투표 리스트 조회',
  })
  @ApiOkResponsePaginated(Poll)
  async getListPublicPoll(@Query() query: GetListPublicPollDto) {
    return await this.pollsService.findListPublicPoll(query);
  }
}
