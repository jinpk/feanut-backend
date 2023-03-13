import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Profile } from 'src/profiles/schemas/profile.schema';
import { FRIEND_MODULE_NAME } from '../friends.constant';
import { FriendDetail } from './friend-detail.schema';

export type FriendDocument = HydratedDocument<Friend>;

@Schema({ collection: FRIEND_MODULE_NAME, timestamps: true })
export class Friend {
  // pk
  id: string;

  @Prop({ type: Types.ObjectId, ref: 'Profile' })
  profile: Profile;

  // 친구리스트
  @Prop({
    type: [{ type: FriendDetail }],
  })
  friends: FriendDetail[];
}

export const FriendSchema = SchemaFactory.createForClass(Friend);
