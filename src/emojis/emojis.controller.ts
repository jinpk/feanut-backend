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
} from '@nestjs/swagger';
import { Public } from '../auth/decorators';
import { EmojisService } from './emojis.service';
import { EmojiDto } from './dtos/emoji.dto';
import { GetListEmojiDto } from './dtos/get-emoji.dto';
import { UpdateEmojiDto } from './dtos/update-emoji.dto';
import { Emoji } from './schemas/emoji.schema';
import { ApiOkResponsePaginated } from 'src/common/decorators';
import { WrappedError } from 'src/common/errors';

@ApiTags('Emoji')
@Controller('emojis')
export class EmojisController {
    constructor(private readonly emojisService: EmojisService) {}

  @Post('')
  @ApiOperation({
    summary: '(ADMIN) New 이모지 등록',
  })
  @ApiOkResponse({
    status: 200,
    type: String,
  })
  async postEmoji(
    @Body() body: Emoji,
    @Request() req) {
        if (!req.user.isAdmin) {
            throw new UnauthorizedException('Not an Admin')
        }
        if (!(await this.emojisService.existFile(body.fileId))) {
            throw new WrappedError('존재하지 않는 fileId입니다.').reject()
        }

        return await this.emojisService.createEmoji(body);
  }

  @Put(':roundId/update')
  @ApiOperation({
    summary: '(ADMIN) Emoji 수정',
  })
  @ApiOkResponse({
    status: 200,
    type: String,
  })
  async putEmoji(
    @Param('emojiId') emojiId: string,
    @Body() body: UpdateEmojiDto,
    @Request() req) {
      if (!req.user.isAdmin) {
        throw new UnauthorizedException('Not an Admin')
      }
      if (!(await this.emojisService.existFile(body.fileId))) {
        throw new WrappedError('존재하지 않는 fileId입니다.').reject()
        }

      const [exist, emoji] = await this.emojisService.existEmoji(emojiId)
      if (!exist) {
        throw new NotFoundException('not found round')
      }

      return await this.emojisService.updateEmoji(emojiId, emoji, body)
  }

  @Get(':emojiId')
  @ApiOperation({
    summary: '등록된 Emoji 상세 조회',
  })
  @ApiOkResponse({
    status: 200,
    type: Emoji,
  })
  async getEmojiDetail(
    @Param('emojiId') emojiId: string,
    @Request() req) {
      if (!req.user.isAdmin) {
        throw new UnauthorizedException('Not an Admin')
      }
      return await this.emojisService.findEmojiById(emojiId)
  }

  @Put(':emojiId/delete')
  @ApiOperation({
    summary: '등록된 Emoji 삭제',
  })
  @ApiOkResponse({
    status: 200,
    type: String,
  })
  async deleteEmoji(
    @Param('emojiId') emojiId: string,
    @Request() req) {
      if (!req.user.isAdmin) {
        throw new UnauthorizedException('Not an Admin')
      }
      return await this.emojisService.removeEmojiById(emojiId)
  }
}

@ApiTags('Emoji')
@Controller('emojis')
export class PublicEmojisController {
  constructor(private readonly emojisService: EmojisService) {}

  @Get('public')
  @Public()
  @ApiOperation({
    summary: '(PUBLIC) emoji 리스트 조회',
  })
  @ApiOkResponsePaginated(EmojiDto)
  async getListPublicEmoji(@Query() query: GetListEmojiDto,
  ) {
      return await this.emojisService.findListEmoji(query);
  }
}
