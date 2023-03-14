import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import {
  ProfileFriends,
  ProfileFriendsSchema,
} from './schemas/profile-friends.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProfileFriends.name, schema: ProfileFriendsSchema },
    ]),
  ],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}
