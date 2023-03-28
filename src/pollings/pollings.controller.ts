import {
  Controller,
  Get,
  Param,
  Delete,
  Patch,
  Put,
  Post,
  Query,
  ForbiddenException,
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
  ReqNewPollingDto,
  PollingResultDto,
  ReceivePollingDto
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
    description: 'selectedAt 최신순서 정렬되어 response',
  })
  @ApiOkResponsePaginated(Polling)
  async getMyInboxList(
    @Query() query: GetListReceivePollingDto,
    @Request() req,
  ) {
    return await this.pollingsService.findListInboxByUserId(
      req.user.id,
      query,
    );
  }

  @Get('recieve/:pollingId/detail')
  @ApiOperation({
    summary: '나의 수신함 상세 조회',
    description: 'selecteProfileId, pollingId 일치. isOpened=true일때 응답.',
  })
  @ApiOkResponse({
    status: 200,
    type: ReceivePollingDto,
  })
  async getInboxDetail(
    @Param('pollingId') pollingId: string,
    @Request() req,
  ) {
    return await this.pollingsService.findInboxPollingByUserId(
      req.user.id,
      pollingId
    );
  }

  @Get(':pollingId/detail')
  @ApiOperation({
    summary: 'Polling 상세 조회',
  })
  @ApiOkResponse({
    status: 200,
    type: PollingDto,
  })
  async getMyPollingDetail(
    @Param('pollingId') pollingId: string,
    @Request() req,
  ) {
    const polling = await this.pollingsService.findPollingById(pollingId);
    if (req.isAdmin) {
    } else if (req.user.id != polling.userId) {
      throw new WrappedError('권한이 없습니다.').reject();
    }

    const dto = this.pollingsService.pollingToDto(polling)

    return dto;
  }

  @Post('receive/:pollingId/open')
  @ApiOperation({
    summary: '수신투표 열람. 피넛 소모',
    description: 'isOpened=true 인 경우 reject: already opened\n\n피넛 수량이 부족한 경우 reject: Lack of total feanut amount'
  })
  @ApiResponse({
    status: 200,
    type: String,
  })
  async postPollingOpen(
    @Param('pollingId') pollingId: string,
    @Request() req,
  ) {
    return await this.pollingsService.updatePollingOpen(
      req.user.id,
      pollingId,
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
      const exist = await this.pollingsService.findUserRoundById(req.user.id, body);

      if (!exist) {
        throw new WrappedError('Not Found Userround').notFound()
      } else {
        if (!exist.pollIds.includes(body.pollId)) {
          throw new WrappedError('Not included pollId').reject()
        }
      }

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
      throw new WrappedError('권한이 없습니다.');
    }

    if ((!exist.selectedProfileId) || (!exist.skipped)) {
      throw new WrappedError('completed already.').alreadyExist();
    }

    return await this.pollingsService.updatePollingResult(
      req.user.id,
      pollingId,
      body
    );
  }
}
