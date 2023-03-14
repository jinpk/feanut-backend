import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendsController } from './friends.controller';
import { FriendsServiceImpl } from './friends.service';
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
  providers: [FriendsServiceImpl],
  exports: [FriendsServiceImpl],
})
export class FriendsModule {}
