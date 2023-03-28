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
  ReqNewPollingDto,
  PollingResultDto
} from './dtos/polling.dto';
import { UserRoundDto, FindUserRoundDto } from './dtos/userround.dto';
import { Polling } from './schemas/polling.schema';
import { UserRound } from './schemas/userround.schema';
import { UpdatePollingDto } from './dtos/update-polling.dto';
import {
  GetListPollingDto,
  GetListReceivePollingDto,
} from './dtos/get-polling.dto';
import { WrappedError } from '../common/errors';

@ApiTags('Polling')
@Controller('pollings')
@ApiBearerAuth()
export class PollingsController {
  constructor(private readonly pollingsService: PollingsService) {}

  @Get('')
  @ApiOperation({
    summary: '(ADMIN) 투표 리스트 조회',
    description: 'userId 미입력 시 전체조회',
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
  async getMyPollingList(
    @Query() query: GetListReceivePollingDto,
    @Request() req,
  ) {
    return await this.pollingsService.findListPollingByUserId(
      req.user.id,
      query,
    );
  }

  @Get(':pollingId/detail')
  @ApiOperation({
    summary: 'Polling 상세내역 조회',
    description: 'Polling userId = 요청 userId가 동일해야 response',
  })
  @ApiOkResponse({
    status: 200,
    type: Polling,
  })
  async getMyPollingDetail(
    @Param('pollingId') pollingId: string,
    @Request() req,
  ) {
    const result = await this.pollingsService.findPollingById(pollingId);
    if (req.isAdmin) {
    } else if (req.user.id != result.userId) {
      throw new WrappedError('권한이 없습니다.').reject();
    }

    return result;
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

  @Post('new')
  @ApiOperation({
    summary: 'New Polling 생성',
  })
  @ApiResponse({
    status: 200,
    type: PollingDto,
  })
  async postPolling(
    @Body() body: ReqNewPollingDto,
    @Request() req) {
    const polling = await this.pollingsService.createPolling(req.user.id, body);
    const dto = this.pollingsService.pollingToDto(polling);
    
    return dto;
  }

  @Get('userround')
  @ApiOperation({
    summary: '사용자 userround조회',
    description: 'GET userRound 조회. todayCount=0|1|2 반환.',
  })
  @ApiOkResponse({
    status: 200,
    type: FindUserRoundDto,
  })
  async getUserRound(@Request() req) {
    const result = await this.pollingsService.findUserRound(req.user.id);
    result.data = this.pollingsService.userRoundToDto(result.data);
    return result
  }

  @Put(':pollingId/refresh')
  @ApiOperation({
    summary: 'polling 친구 새로고침',
    description: 'refreshCount < 2이면 pass.',
  })
  @ApiResponse({
    status: 200,
    type: PollingDto,
  })
  async putRefreshPolling(
    @Param('pollingId') pollingId: string,
    @Request() req,
  ) {
    const exist = await this.pollingsService.findPollingById(pollingId);
    if (exist.userId != req.user.id) {
      throw new WrappedError('권한이 없습니다');
    }
    const result = await this.pollingsService.updateRefreshedPollingById(
      req.user.id,
      pollingId,
    );

    const dto = this.pollingsService.pollingToDto(result);

    return dto
  }

  @Put(':pollingId/result')
  @ApiOperation({
    summary: 'polling 결과 업데이트',
  })
  @ApiResponse({
    status: 200,
    type: PollingResultDto,
  })
  async putPollingResult(
    @Param('pollingId') pollingId: string,
    @Body() body: UpdatePollingDto,
    @Request() req,
  ) {
    const exist = await this.pollingsService.findPollingById(pollingId);
    if (exist.userId != req.user.id) {
      throw new WrappedError('권한이 없습니다');
    }
    return await this.pollingsService.updatePollingResult(
      req.user.id,
      pollingId,
      body
    );
  }
}
