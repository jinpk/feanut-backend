import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators';
import { EmojisService } from './emojis.service';
import { EmojiDto } from './dtos/emoji.dto';
import { GetListEmojiDto } from './dtos/get-emoji.dto';
import { ApiOkResponsePaginated } from 'src/common/decorators';

@ApiTags('Emoji')
@Controller('emojis')
export class EmojisController {
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
