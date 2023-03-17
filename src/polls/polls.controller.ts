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
import { UpdatePollDto, UpdateRoundDto, UpdatePollIdsDto } from './dtos/update-poll.dto';
import { GetListRoundDto, GetListPollDto } from './dtos/get-poll.dto';
import { Round } from './schemas/round.schema';
import { Poll } from './schemas/poll.schema';
import { ApiOkResponsePaginated } from 'src/common/decorators';

@ApiTags('Poll')
@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

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

  @Get('')
  @ApiOperation({
    summary: '(ADMIN) 등록된 투표 상세 조회',
    description: 'userId 미입력 시 전체조회',
  })
  @ApiOkResponse({
    status: 200,
    type: Poll,
  })
  async getPollDetail(@Query() query: GetListPollDto) {

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
  async getRoundDetail(@Query() query: GetListPollDto) {

  }

  @Put('rounds/:roundId/pollIds')
  @ApiOperation({
    summary: '라운드 PollIds 수정',
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

  }

  @Put('rounds/:roundId')
  @ApiOperation({
    summary: '라운드 수정',
  })
  @ApiBody({
    type: UpdateRoundDto,
  })
  @ApiOkResponse({
    status: 200,
    type: String,
  })
  async putRound(@Param('roundId') roundId, @Body() body) {

  }
}
