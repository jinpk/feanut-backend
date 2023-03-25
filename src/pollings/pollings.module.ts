import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Polling, PollingSchema } from './schemas/polling.schema';
import { UserRound, UserRoundSchema } from './schemas/userround.schema';
import { Coin, CoinSchema } from '../coins/schemas/coin.schema';
import { Poll, PollSchema } from '../polls/schemas/poll.schema';
import { Round, RoundSchema } from '../polls/schemas/round.schema';
import { Friend, FriendSchema } from '../friendships/schemas/friend.schema';
import { ProfilesModule } from 'src/profiles/profiles.module';
import { PollingsService } from './pollings.service';
import { PollingsController } from './pollings.controller';
import { UsersModule } from 'src/users/users.module';
import { CoinsModule } from 'src/coins/coins.module';
import { FriendsModule } from 'src/friendships/friendships.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Polling.name, schema: PollingSchema }]),
    MongooseModule.forFeature([{ name: Coin.name, schema: CoinSchema }]),
    MongooseModule.forFeature([{ name: Friend.name, schema: FriendSchema }]),
    MongooseModule.forFeature([
      { name: UserRound.name, schema: UserRoundSchema },
    ]),
    MongooseModule.forFeature([{ name: Poll.name, schema: PollSchema }]),
    MongooseModule.forFeature([{ name: Round.name, schema: RoundSchema }]),
    ProfilesModule,
    UsersModule,
    CoinsModule,
    FriendsModule,
  ],
  controllers: [PollingsController],
  providers: [PollingsService],
  exports: [PollingsService],
})
export class PollingsModule {}
