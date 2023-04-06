import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionFields } from 'mongoose';
import { PagingResDto } from 'src/common/dtos';
import { EmojiDto } from './dtos/emoji.dto';
import { Emoji, EmojiDocument } from './schemas/emoji.schema';
import { GetListEmojiDto } from './dtos/get-emoji.dto';
import { UtilsService } from 'src/common/providers';

@Injectable()
export class EmojisService {
  constructor(
    @InjectModel(Emoji.name) private emojiModel: Model<EmojiDocument>,
    private utilsService: UtilsService,
  ) {}

  async existEmoji(emoji_id: string): Promise<[boolean, Emoji]> {
    const emoji = await this.emojiModel.findById(emoji_id);

    if (emoji) {
      return [true, emoji];
    }

    return [false, new Emoji()];
  }

  async findListEmoji(query: GetListEmojiDto): Promise<PagingResDto<EmojiDto>> {
    const projection: ProjectionFields<EmojiDto> = {
      _id: 0,
      key: 1,
      id: '$_id',
    };

    const cursor = await this.emojiModel.aggregate([
      { $project: projection },
      { $sort: { createdAt: -1 } },
      this.utilsService.getCommonMongooseFacet(query),
    ]);

    const metdata = cursor[0].metadata;
    const data = cursor[0].data;

    return {
      total: metdata[0]?.total || 0,
      data: data,
    };
  }
}
