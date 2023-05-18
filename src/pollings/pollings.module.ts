import { SchoolsModule } from './../schools/schools.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Polling, PollingSchema } from './schemas/polling.schema';
import { UserRound, UserRoundSchema } from './schemas/user-round.schema';
import { Poll, PollSchema } from '../polls/schemas/poll.schema';
import { Round, RoundSchema } from '../polls/schemas/round.schema';
import { ProfilesModule } from 'src/profiles/profiles.module';
import { PollingsService } from './pollings.service';
import { PollingsController } from './pollings.controller';
import { CoinsModule } from 'src/coins/coins.module';
import { FriendshipsModule } from 'src/friendships/friendships.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Polling.name, schema: PollingSchema }]),
    MongooseModule.forFeature([
      { name: UserRound.name, schema: UserRoundSchema },
    ]),
    MongooseModule.forFeature([{ name: Poll.name, schema: PollSchema }]),
    MongooseModule.forFeature([{ name: Round.name, schema: RoundSchema }]),
    ProfilesModule,
    CoinsModule,
    FriendshipsModule,
    SchoolsModule,
  ],
  controllers: [PollingsController],
  providers: [PollingsService],
  exports: [PollingsService],
})
export class PollingsModule {}
