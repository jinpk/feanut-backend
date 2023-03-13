import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Profile } from 'src/profiles/schemas/profile.schema';
import { SCHEMA_NAME } from '../friends.constant';
import { FriendSchema, Friend } from './friend.schema';

export type ProfileFriendsDocument = HydratedDocument<ProfileFriends>;

@Schema({ collection: SCHEMA_NAME, timestamps: true })
export class ProfileFriends {
  // pk
  id: string;

  @Prop({ type: Types.ObjectId, ref: Profile.name })
  profile: Profile;

  // 친구리스트
  @Prop({
    type: [{ type: FriendSchema }],
  })
  friends: Friend[];
}

export const ProfileFriendsSchema =
  SchemaFactory.createForClass(ProfileFriends);
