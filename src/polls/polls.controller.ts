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
  UnauthorizedException,
  Body,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { PollsService } from './polls.service';
import { PollDto } from './dtos/poll.dto';
import { RoundDto } from './dtos/round.dto';
import { UpdatePollDto, UpdateRoundDto, UpdatePollIdsDto } from './dtos/update-poll.dto';
import { GetListRoundDto, GetListPollDto } from './dtos/get-poll.dto';
import { Round } from './schemas/round.schema';
import { Poll } from './schemas/poll.schema';
import { ApiOkResponsePaginated } from 'src/common/decorators';

@ApiTags('Poll')
@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Post('rounds')
  @ApiOperation({
    summary: '(ADMIN) New 라운드 등록',
  })
  @ApiBody({
    type: RoundDto,
  })
  @ApiOkResponse({
    status: 200,
    type: String,
  })
  async postRound(@Body() body) {
    return await this.pollsService.createRound(body);
  }

  @Post('')
  @ApiOperation({
    summary: '(ADMIN) New Poll 등록',
    description: 'emoji 컬럼: 특정 emoji를 등록하려면 emoji index 입력. default: 0인 경우 emotion에 따라 랜덤',
  })
  @ApiBody({
    type: PollDto,
  })
  @ApiOkResponse({
    status: 200,
    type: String,
  })
  async postPoll(@Body() body) {
    return await this.pollsService.createPoll(body);
  }

  @Put('rounds/:roundId/pollIds')
  @ApiOperation({
    summary: '(ADMIN) 라운드 PollIds 수정',
    description: 'delete=false 이면 해당 pollId를 추가. delete=true 이면 해당 pollId를 삭제.',
  })
  @ApiBody({
    type: UpdatePollIdsDto,
  })
  @ApiOkResponse({
    status: 200,
    type: String,
  })
  async putPollIds(@Param('roundId') roundId, @Body() body) {
    const [exist, round] = await this.pollsService.existRound(roundId)
    if (!exist) {
      throw new NotFoundException('not found round')
    }
    return await this.pollsService.updatePollIds(roundId, round, body)
  }

  @Put('rounds/:roundId')
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
  async putRound(@Param('roundId') roundId, @Body() body) {
    const [exist, round] = await this.pollsService.existRound(roundId)
    if (!exist) {
      throw new NotFoundException('not found round')
    }

    return await this.pollsService.updateRound(roundId, round, body)
  }

  @Put(':pollId')
  @ApiOperation({
    summary: '(ADMIN) Poll 수정',
  })
  @ApiBody({
    type: UpdateRoundDto,
  })
  @ApiOkResponse({
    status: 200,
    type: String,
  })
  async putPoll(@Param('pollId') pollId, @Body() body) {
    const [exist, poll] = await this.pollsService.existPoll(pollId)
    if (!exist) {
      throw new NotFoundException('not found poll')
    }

    return await this.pollsService.updatePoll(pollId, poll, body)
  }

  @Get('rounds')
  @ApiOperation({
    summary: '(ADMIN) 라운드 목록 조회',
  })
  @ApiOkResponsePaginated(Round)
  async getListRound(@Query() query: GetListRoundDto) {
    return await this.pollsService.findListRound(query);
  }

  @Get('')
  @ApiOperation({
    summary: '(ADMIN) 등록된 투표 목록 조회',
  })
  @ApiOkResponsePaginated(Poll)
  async getListPoll(@Query() query: GetListPollDto) {
    return await this.pollsService.findListPoll(query);
  }

  @Get('rounds/:roundId')
  @ApiOperation({
    summary: '(ADMIN) 등록된 라운드 상세 조회',
    description: 'userId 미입력 시 전체조회',
  })
  @ApiOkResponse({
    status: 200,
    type: Poll,
  })
  async getRoundDetail(@Param('roundId') roundId) {
    return await this.pollsService.findRoundOne()
  }

  @Get(':/pollId')
  @ApiOperation({
    summary: '(ADMIN) 등록된 투표 상세 조회',
    description: 'userId 미입력 시 전체조회',
  })
  @ApiOkResponse({
    status: 200,
    type: Poll,
  })
  async getPollDetail(@Param('pollId') pollId) {
    return await this.pollsService.findPollOne()
  }

}
