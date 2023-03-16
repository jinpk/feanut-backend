import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Polling, PollingSchema } from './schemas/polling.schema';
import { Coin, CoinSchema } from '../coins/schemas/coin.schema';
import { ProfilesModule } from 'src/profiles/profiles.module';
import { PollingsService } from './pollings.service';
import { PollingsController } from './pollings.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Polling.name, schema: PollingSchema }]),
    MongooseModule.forFeature([{ name: Coin.name, schema: CoinSchema }]),
    ProfilesModule,
  ],
  controllers: [PollingsController],
  providers: [PollingsService],
  exports: [PollingsService],
})
export class PollingsModule {}
