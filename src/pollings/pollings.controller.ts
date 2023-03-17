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
} from '@nestjs/swagger'
import { ApiOkResponsePaginated } from 'src/common/decorators';
import { PollingsService } from './pollings.service';
import { PollingDto } from './dtos/polling.dto';
import { Polling } from './schemas/polling.schema'
import { UpdatePollingDto } from './dtos/update-polling.dto';
import { GetListPollingDto, GetPollingDto } from './dtos/get-polling.dto';

@ApiTags('Polling')
@Controller('pollings')
export class PollingsController {
  constructor(
    private readonly pollingsService: PollingsService,
  ) {}

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
  async getMyPollingList(@Query() query: GetListPollingDto) {
    return await this.pollingsService.findListPollingByProfile(query);
  }

  @Get('recieve/:pollingId')
  @ApiOperation({
      summary: '수신 상세내역 조회',
  })
  @ApiOkResponse({
    status: 200,
    type: Polling,
  })
  async getMyPollingDetail(
    @Param('pollingId') pollingId,
    @Query() query: GetPollingDto) {
      return await this.pollingsService.findListPollingById(query);
  }

  @Post('receive/:pollingId/open')
  @ApiResponse({
      status: 200,
      type: String,
  })
  async postPollingOpen(@Param('pollingId') pollingId, @Request() req) {
      return await this.pollingsService.createPollingOpen(req.user.id, pollingId);
  }

  @Post('')
  @ApiOperation({
    summary: 'polling 생성',
    description: '건너뛰기 선택 시 selectedProfileId는 empty string',
  })
  @ApiBody({
      type: PollingDto,
  })
  @ApiResponse({
      status: 200,
      type: String,
  })
  async postPolling(@Body() body, @Request() req) {
      return await this.pollingsService.createPolling(req.user.id, body);
  }

  // @Get('refresh/:pollingId')
  // @ApiOperation({
  //     summary: '수신 상세내역 조회',
  // })
  // async getRefreshedPolling(@Query() query: GetPollingDto) {
  //   return await this.pollingsService.findRefreshedPollingById(query);
  // }
}
