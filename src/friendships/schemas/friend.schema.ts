import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Profile } from 'src/profiles/schemas/profile.schema';

export type FriendDocument = HydratedDocument<Friend>;

@Schema({ _id: false })
export class Friend {
  // 내가 추가한 친구
  @Prop({ type: Types.ObjectId, ref: Profile.name })
  profileId: Types.ObjectId;

  // 내가 설정한 친구 이름
  @Prop({})
  name: string;

  // 숨김여부
  @Prop({})
  hidden?: boolean;
}

export const FriendSchema = SchemaFactory.createForClass(Friend);
