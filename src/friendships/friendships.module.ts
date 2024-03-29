import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfilesModule } from 'src/profiles/profiles.module';
import { UsersModule } from 'src/users/users.module';
import { FriendshipsController } from './friendships.controller';
import { FriendshipsService } from './friendships.service';
import { Friendship, FriendShipSchema } from './schemas/friendships.schema';
import { UserRound, UserRoundSchema } from 'src/pollings/schemas/user-round.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Friendship.name, schema: FriendShipSchema },
    ]),
    MongooseModule.forFeature([{ name: UserRound.name, schema: UserRoundSchema },]),
    ProfilesModule,
    UsersModule,
  ],
  controllers: [FriendshipsController],
  providers: [FriendshipsService],
  exports: [FriendshipsService],
})
export class FriendshipsModule {}
