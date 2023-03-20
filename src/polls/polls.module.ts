import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Round, RoundSchema } from './schemas/round.schema';
import { Poll, PollSchema } from './schemas/poll.schema';
import { PollsService } from './polls.service';
import { PollsController, PublicPollsController } from './polls.controller';
import { ProfilesModule } from 'src/profiles/profiles.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Poll.name, schema: PollSchema }]),
    MongooseModule.forFeature([{ name: Round.name, schema: RoundSchema }]),
    ProfilesModule,
  ],
  providers: [PollsService],
  controllers: [PollsController, PublicPollsController],
  exports: [PollsService],
})
export class PollsModule {}
