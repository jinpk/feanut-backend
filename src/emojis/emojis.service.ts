import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery,
  Model,
  PipelineStage,
  ProjectionFields,
  Types,
} from 'mongoose';
import { PagingResDto } from 'src/common/dtos';
import { EmojiDto } from './dtos/emoji.dto';
import { Emoji, EmojiDocument } from './schemas/emoji.schema';
import { GetListEmojiDto } from './dtos/get-emoji.dto';
import { UtilsService } from 'src/common/providers';
import { FilesService } from 'src/files/files.service';
import { CreateEmojiDto } from './dtos';

@Injectable()
export class EmojisService {
  constructor(
    @InjectModel(Emoji.name) private emojiModel: Model<EmojiDocument>,
    private utilsService: UtilsService,
    private filesService: FilesService,
  ) {}

  async existFile(fileId: string): Promise<boolean> {
    return await this.filesService.hasById(fileId);
  }

  async createEmoji(body: CreateEmojiDto) {
    const result = await new this.emojiModel({
      fileId: new Types.ObjectId(body.fileId),
    }).save();

    return result._id.toString();
  }

  async existEmoji(emoji_id: string): Promise<[boolean, Emoji]> {
    const emoji = await this.emojiModel.findById(emoji_id);

    if (emoji) {
      return [true, emoji];
    }

    return [false, new Emoji()];
  }

  async findListEmoji(query: GetListEmojiDto): Promise<PagingResDto<EmojiDto>> {
    const filter: FilterQuery<EmojiDocument> = {
      isDeleted: false,
    };

    const lookups: PipelineStage[] = [
      {
        $lookup: {
          from: 'files',
          localField: 'fileId',
          foreignField: '_id',
          as: 'files',
        },
      },
      {
        $unwind: {
          path: '$files',
          preserveNullAndEmptyArrays: false,
        },
      },
    ];

    const projection: ProjectionFields<EmojiDto> = {
      id: '$_id',
      _id: 0,
      key: '$files.key',
    };

    const cursor = await this.emojiModel.aggregate([
      { $match: filter },
      ...lookups,
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

  async findEmojiById(emoji_id: string) {
    const emoji = await this.emojiModel.findById(emoji_id);
    if (!emoji) return null;
    return emoji.toObject();
  }
}
