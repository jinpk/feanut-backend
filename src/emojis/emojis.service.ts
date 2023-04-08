import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, ProjectionFields } from 'mongoose';
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
    console.log(query)
    const paging = query.page && query.limit;

    const projection: ProjectionFields<EmojiDto> = {
      _id: 0,
      key: 1,
      id: '$_id',
    };

    const pipeline: PipelineStage[] = [{ $project: projection }];

    if (paging) {
      pipeline.push(
        this.utilsService.getCommonMongooseFacet({
          page: query.page,
          limit: query.limit,
        }),
      );
      const cursor = await this.emojiModel.aggregate(pipeline);
      const metdata = cursor[0].metadata;
      const data = cursor[0].data;
      return {
        total: metdata[0]?.total || 0,
        data: data,
      };
    } else {
      const doc = await this.emojiModel.aggregate<EmojiDto>(pipeline);
      return {
        total: doc.length,
        data: doc,
      };
    }
  }
}
