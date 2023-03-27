import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfilesModule } from 'src/profiles/profiles.module';
import { FriendshipsController } from './friendships.controller';
import { FriendshipsService } from './friendships.service';
import { Friendship, FriendShipSchema } from './schemas/friendships.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Friendship.name, schema: FriendShipSchema },
    ]),
    ProfilesModule,
  ],
  controllers: [FriendshipsController],
  providers: [FriendshipsService],
  exports: [FriendshipsService],
})
export class FriendshipsModule {}
