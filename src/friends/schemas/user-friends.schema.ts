import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { SCHEMA_NAME } from '../friends.constant';
import { FriendSchema, Friend } from './friend.schema';

export type UserFriendsDocument = HydratedDocument<UserFriends>;

@Schema({ collection: SCHEMA_NAME, timestamps: true })
export class UserFriends {
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

export const UserFriendsSchema = SchemaFactory.createForClass(UserFriends);
