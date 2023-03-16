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
import { UpdatePollDto } from './dtos/update-poll.dto';
import { GetListRoundDto, GetListPollDto } from './dtos/get-poll.dto';
import { Round } from './schemas/round.schema';
import { ApiOkResponsePaginated } from 'src/common/decorators';

@ApiTags('Poll')
@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Get('rounds')
  @ApiOperation({
    summary: '(ADMIN) 라운드 목록 조회',
    description: 'userId 미입력 시 전체조회',
  })
  @ApiOkResponsePaginated(Round)
  async getListRound(@Query() query: GetListRoundDto) {}
}
