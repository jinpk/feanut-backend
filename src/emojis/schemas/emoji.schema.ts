import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EMOJI_SCHEMA_NAME } from '../emojis.constant';
import { File } from 'src/files/schemas/files.schema';

export type EmojiDocument = HydratedDocument<Emoji>;

@Schema({ collection: EMOJI_SCHEMA_NAME, timestamps: true })
export class Emoji {
  _id: Types.ObjectId;
  // fileId
  @Prop({ type: Types.ObjectId, ref: File.name, default: null })
  fileId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  // isDeleted
  @Prop({ default: false })
  isDeleted: boolean;

  // 생성시간
  @Prop({})
  createdAt?: Date;
}

export const EmojiSchema = SchemaFactory.createForClass(Emoji);
