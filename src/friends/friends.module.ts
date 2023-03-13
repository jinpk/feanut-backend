import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { Friend, FriendSchema } from './schemas/friend.schema';
import {
  ProfileFriends,
  ProfileFriendsSchema,
} from './schemas/profile-friends.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Friend.name, schema: FriendSchema }]),
    MongooseModule.forFeature([
      { name: ProfileFriends.name, schema: ProfileFriendsSchema },
    ]),
  ],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}
