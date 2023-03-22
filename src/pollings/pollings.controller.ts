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
  ApiResponse,
} from '@nestjs/swagger';
import { ApiOkResponsePaginated } from 'src/common/decorators';
import { PollingsService } from './pollings.service';
import {
  PollingDto,
  PollingOpenDto,
  PollingRefreshDto,
} from './dtos/polling.dto';
import { Polling } from './schemas/polling.schema';
import { UserRound } from './schemas/userround.schema';
import { UpdatePollingDto } from './dtos/update-polling.dto';
import {
  GetListPollingDto,
  GetListReceivePollingDto,
} from './dtos/get-polling.dto';
import { UserRoundDto, PayUserRoundDto } from './dtos/userround.dto';
import { WrappedError } from '../common/errors';

@ApiTags('Polling')
@Controller('pollings')
@ApiBearerAuth()
export class PollingsController {
  constructor(private readonly pollingsService: PollingsService) {}

  @Get('')
  @ApiOperation({
    summary: '(ADMIN) 투표 리스트 조회',
    description: 'profiledId 미입력 시 전체조회',
  })
  @ApiOkResponsePaginated(Polling)
  async getPollingList(@Query() query: GetListPollingDto) {
    return await this.pollingsService.findListPolling(query);
  }

  @Get('recieve')
  @ApiOperation({
    summary: '나의 수신 리스트 조회',
  })
  @ApiOkResponsePaginated(Polling)
  async getMyPollingList(@Query() query: GetListReceivePollingDto) {
    return await this.pollingsService.findListPollingByProfileId(query);
  }

  @Get(':pollingId')
  @ApiOperation({
    summary: 'Polling 상세내역 조회',
  })
  @ApiOkResponse({
    status: 200,
    type: Polling,
  })
  async getMyPollingDetail(@Param('pollingId') pollingId: string) {
    return await this.pollingsService.findPollingById(pollingId);
  }

  @Post('receive/:pollingId/open')
  @ApiOperation({
    summary: '수신투표 열람. 피넛 소모',
  })
  @ApiBody({
    type: PollingOpenDto,
  })
  @ApiResponse({
    status: 200,
    type: String,
  })
  async postPollingOpen(
    @Param('pollingId') pollingId: string,
    @Body() body: PollingOpenDto,
    @Request() req,
  ) {
    return await this.pollingsService.updatePollingOpen(
      req.user.id,
      pollingId,
      body,
    );
  }

  @Post('userround')
  @ApiOperation({
    summary: 'New userRound 생성',
    description: '생성 전 GET userRound먼저 조회. 조건에 따라 userRound 생성',
  })
  @ApiResponse({
    status: 200,
    type: UserRoundDto,
  })
  async postUserRound(@Request() req) {
    var rounds = await this.pollingsService.findUserRound(req.user.id);
    if (rounds.todayCount >= 2) {
      throw new WrappedError('일일 투표 횟수 초과').reject();
    }
    return await this.pollingsService.createUserRound(req.user.id, rounds);
  }

  @Post('')
  @ApiOperation({
    summary: 'New Polling 생성',
    description: 'userRound 생성 시 기본 12개 생성. 이후 1개씩 추가. 라운드당 촤대 5번 건너뛰기 가능.',
  })
  @ApiResponse({
    status: 200,
    type: PollingDto,
  })
  async postPolling(@Request() req) {
    const userround = await this.pollingsService.findRecentUserRound(req.user.id);
    if (userround.pollIds.length >= 17) {
      throw new WrappedError('투표 건너뛰기 횟수 초과').reject();
    }
    return await this.pollingsService.createPolling(req.user.id, userround);
  }

  @Get('userround')
  @ApiOperation({
    summary: '사용자 userround조회',
    description: '생성 전 GET userRound 조회. todayCount=0|1|2 반환.',
  })
  @ApiOkResponse({
    status: 200,
    type: UserRound,
  })
  async getUserRound(@Request() req) {
    return await this.pollingsService.findUserRound(req.user.id);
  }

  @Put(':pollingId')
  @ApiOperation({
    summary: 'polling 친구 새로고침',
    description:
      'refreshCount < 2이면 pass. 아니면 amount를 0 이상의 숫자인지 확인하여 feanut소모.',
  })
  @ApiBody({
    type: PollingRefreshDto,
  })
  @ApiResponse({
    status: 200,
    type: Polling,
  })
  async putRefreshPolling(
    @Param('pollingId') pollingId: string,
    @Body() body,
    @Request() req,
  ) {
    return await this.pollingsService.updateRefreshedPollingById(
      req.user.id,
      pollingId,
      body,
    );
  }
}
