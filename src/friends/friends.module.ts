import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { UserFriends, UserFriendsSchema } from './schemas/user-friends.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserFriends.name, schema: UserFriendsSchema },
    ]),
  ],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}
