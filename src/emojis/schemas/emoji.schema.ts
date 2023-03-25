import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now, Types } from 'mongoose';
import { EMOJI_MODULE_NAME } from '../emojis.constant';
import { Emotion } from '../../polls/enums'
import { File } from 'src/files/schemas/files.schema';

export type EmojiDocument = HydratedDocument<Emoji>;

// Poll
@Schema({ collection: EMOJI_MODULE_NAME, timestamps: true })
export class Emoji {
    // emotion
    @Prop({})
    emotion: Emotion;

    // fileId
    @Prop({type: Types.ObjectId, ref: File.name, default: null})
    fileId: Types.ObjectId;

    // isDeleted
    @Prop({default: false})
    isDeleted: boolean;
  
    // 생성시간
    @Prop({})
    createdAt?: Date;
}

export const EmojiSchema = SchemaFactory.createForClass(Emoji);
