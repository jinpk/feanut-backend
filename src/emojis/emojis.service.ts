import { Injectable, Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  now,
  FilterQuery,
  Model,
  PipelineStage,
  ProjectionFields,
  Types,
} from 'mongoose';
import { PagingResDto } from 'src/common/dtos';
import { EmojiDto, PublicEmojiDto } from './dtos/emoji.dto';
import { Emoji, EmojiDocument } from './schemas/emoji.schema';
import { GetListEmojiDto } from './dtos/get-emoji.dto';
import { UtilsService } from 'src/common/providers';
import { FilesService } from 'src/files/files.service';
import { UpdateEmojiDto } from './dtos';

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

  async createEmoji(body: EmojiDto) {
    let emoji = new Emoji();
    emoji = {
      emotion: body.emotion,
      fileId: new Types.ObjectId(body.fileId),
      isDeleted: false,
    };
    const result = await new this.emojiModel(emoji).save();

    return result._id.toString();
  }

  async existEmoji(emoji_id: string): Promise<[boolean, Emoji]> {
    const emoji = await this.emojiModel.findById(emoji_id);

    if (emoji) {
      return [true, emoji];
    }

    return [false, new Emoji()];
  }

  async updateEmoji(emoji_id: string, emoji: Emoji, body: UpdateEmojiDto) {
    await this.emojiModel.findByIdAndUpdate(emoji_id, {
      $set: {
        emotion: body.emotion,
        fileId: body.fileId,
        isDeleted: false,
      },
    });
  }

  async findListEmoji(
    query: GetListEmojiDto,
  ): Promise<PagingResDto<PublicEmojiDto>> {
    const filter: FilterQuery<EmojiDocument> = {
      isDeleted: false,
    };

    if (query.emotion != undefined) {
      filter.emotion = query.emotion;
    }

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
      _id: 1,
      emotion: 1,
      assetKey: '$files.key',
      friendIds: 1,
      selectedAt: 1,
      createdAt: 1,
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

  async removeEmojiById(emoji_id: string) {
    const result = await this.emojiModel.findByIdAndUpdate(emoji_id, {
      $set: {
        isDeleted: true,
      },
    });

    return result._id.toString();
  }
}
