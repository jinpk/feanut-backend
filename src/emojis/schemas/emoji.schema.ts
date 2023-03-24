import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now } from 'mongoose';
import { EMOJI_MODULE_NAME } from '../emojis.constant';
import { Emotion } from '../../polls/enums'

export type EmojiDocument = HydratedDocument<Emoji>;

// Poll
@Schema({ collection: EMOJI_MODULE_NAME, timestamps: true })
export class Emoji {
    // emotion
    @Prop({})
    emotion: Emotion;

    // emoji filepath
    @Prop({})
    emojiFilePath: string;

    // isDeleted
    @Prop({default: false})
    isDeleted: boolean;
  
    // 생성시간
    @Prop({})
    createdAt?: Date;
}

export const EmojiSchema = SchemaFactory.createForClass(Emoji);
