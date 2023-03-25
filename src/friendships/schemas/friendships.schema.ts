import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { SCHEMA_NAME } from '../friendships.constant';
import { FriendSchema, Friend } from './friend.schema';

export type FriendShipDocument = HydratedDocument<Friendship>;

@Schema({ collection: SCHEMA_NAME, timestamps: true })
export class Friendship {
  // pk
  _id: Types.ObjectId;

  // 사용자 ID
  @Prop({ type: Types.ObjectId, ref: User.name })
  userId: Types.ObjectId;

  // 친구 목록
  @Prop({
    type: [{ type: FriendSchema }],
  })
  friends: Friend[];
}

export const FriendShipSchema = SchemaFactory.createForClass(Friendship);
