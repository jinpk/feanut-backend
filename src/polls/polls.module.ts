import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Round, RoundSchema } from './schemas/round.schema';
import { Poll, PollSchema } from './schemas/poll.schema';
import { PollsService } from './polls.service';
import { PollsGetController } from './polls.controller';
import { ProfilesModule } from 'src/profiles/profiles.module';
import {
  PollRoundEvent,
  PollRoundEventSchema,
} from './schemas/round-event.schema';
import { EmojisModule } from 'src/emojis/emojis.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Poll.name, schema: PollSchema }]),
    MongooseModule.forFeature([{ name: Round.name, schema: RoundSchema }]),
    MongooseModule.forFeature([
      { name: PollRoundEvent.name, schema: PollRoundEventSchema },
    ]),
    ProfilesModule,
    EmojisModule,
  ],
  providers: [PollsService],
  controllers: [
    PollsGetController,
    //PollsController, PublicPollsController
  ],
  exports: [PollsService],
})
export class PollsModule {}
