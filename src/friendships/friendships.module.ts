import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfilesModule } from 'src/profiles/profiles.module';
import { FriendsController } from './friendships.controller';
import { FriendShipsService } from './friendships.service';
import { FriendShip, FriendShipSchema } from './schemas/friendships.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FriendShip.name, schema: FriendShipSchema },
    ]),
    ProfilesModule,
  ],
  controllers: [FriendsController],
  providers: [FriendShipsService],
  exports: [FriendShipsService],
})
export class FriendsModule {}
