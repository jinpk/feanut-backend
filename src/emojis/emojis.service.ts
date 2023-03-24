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
import { EmojiDto } from './dtos/emoji.dto';
import { Emoji, EmojiDocument } from './schemas/emoji.schema';
import { GetListEmojiDto } from './dtos/get-emoji.dto';
import { UtilsService } from 'src/common/providers';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class EmojisService {
    constructor(
        @InjectModel(Emoji.name) private emojiModel: Model<EmojiDocument>,
        private utilsService: UtilsService,
        private filesService: FilesService,
    ) {}

    async existFile(file_path: string){

    }

    async createEmoji(body: EmojiDto) {

    }

    async existEmoji(emoji_id: string): Promise<[boolean, Emoji]> {

        return [true, new Emoji()]
    }

    async updateEmoji(
        emoji_id:string,
        emoji: Emoji,
        body) {

    }

    async findListEmoji(body) {

    }

    async findEmojiById(emoji_id: string) {

    }

    async removeEmojiById(emoji_id: string) {
        
    }
}
