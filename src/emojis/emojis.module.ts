import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Emoji, EmojiSchema } from './schemas/emoji.schema';
import { EmojisService } from './emojis.service';
import { EmojisController, PublicEmojisController } from './emojis.controller';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Emoji.name, schema: EmojiSchema }]),
    FilesModule,
  ],
  providers: [EmojisService],
  controllers: [EmojisController, PublicEmojisController],
  exports: [EmojisService],
})
export class EmojisModule {}