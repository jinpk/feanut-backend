import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Profile } from 'src/profiles/schemas/profile.schema';

export type FriendDocument = HydratedDocument<Friend>;

@Schema({ _id: false })
export class Friend {
  // 친구
  @Prop({ type: Types.ObjectId, ref: Profile.name })
  profile: Profile;

  // 숨김여부
  @Prop({})
  hidden?: boolean;
}

export const FriendSchema = SchemaFactory.createForClass(Friend);
