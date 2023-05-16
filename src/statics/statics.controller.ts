import { Body, Controller, Post, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTryOpenLogDto } from './dtos';
import { StaticsService } from './statics.service';

@ApiTags('Static')
@Controller('statics')
@ApiBearerAuth()
export class StaticsController {
  constructor(private staticsService: StaticsService) {}

  @Post('tryopenlog')
  @ApiOperation({
    summary: '유저 수신함 잠금해제(open) 버튼 클릭 log',
    description: '유저 open 버튼 클릭 후 실제 결제까지 이어지는지 확인하기 위한 log',
  })
  @ApiOkResponse()
  async uploadFile(@Req() req, @Body() body: CreateTryOpenLogDto) {
    return await this.staticsService.createTryOpenLog(req.user.id, body);
  }
}
