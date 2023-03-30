import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators';
import { EmojisService } from './emojis.service';
import { EmojiDto } from './dtos/emoji.dto';
import { GetListEmojiDto } from './dtos/get-emoji.dto';
import { ApiOkResponsePaginated } from 'src/common/decorators';
import { WrappedError } from 'src/common/errors';
import { CreateEmojiDto } from './dtos';
import {
  EMOJI_MODULE_NAME,
  EMOJI_ERROR_NOT_FOUND_FILEID,
} from './emojis.constant';

@ApiTags('Emoji')
@Controller('emojis')
@ApiBearerAuth()
export class EmojisController {
  constructor(private readonly emojisService: EmojisService) {}

  @Post('')
  @ApiOperation({
    summary: '이모지 등록',
  })
  @ApiBody({
    type: CreateEmojiDto,
  })
  @ApiOkResponse({
    status: 200,
    type: String,
  })
  async createEmoji(@Body() body: CreateEmojiDto, @Request() req) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Not an Admin');
    }
    if (!(await this.emojisService.existFile(body.fileId))) {
      throw new WrappedError(
        EMOJI_MODULE_NAME,
        EMOJI_ERROR_NOT_FOUND_FILEID,
        ).notFound();
    }

    return await this.emojisService.createEmoji(body);
  }
}

@ApiTags('Emoji')
@Controller('emojis')
export class EmojisPublicController {
  constructor(private readonly emojisService: EmojisService) {}

  @Get('')
  @Public()
  @ApiOperation({
    summary: '전체 조회',
  })
  @ApiOkResponsePaginated(EmojiDto)
  async getListPublicEmoji(@Query() query: GetListEmojiDto) {
    return await this.emojisService.findListEmoji(query);
  }
}
