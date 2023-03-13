import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Profile } from 'src/profiles/schemas/profile.schema';
import { FRIEND_SCHEMA_DETAIL_NAME } from '../friends.constant';

@Schema({ collection: FRIEND_SCHEMA_DETAIL_NAME })
export class FriendDetail {
  // 친구
  @Prop({ type: Types.ObjectId, ref: 'Profile' })
  profile: Profile;

  // 숨김여부
  @Prop()
  hidden?: boolean;
}
