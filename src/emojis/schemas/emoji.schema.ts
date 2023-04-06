import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EMOJI_SCHEMA_NAME } from '../emojis.constant';

export type EmojiDocument = HydratedDocument<Emoji>;

@Schema({ collection: EMOJI_SCHEMA_NAME, timestamps: true })
export class Emoji {
  _id: Types.ObjectId;

  // Google Cloud Storage Pointed Key
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  name: string;
}

export const EmojiSchema = SchemaFactory.createForClass(Emoji);
