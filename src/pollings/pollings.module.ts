import { Module } from '@nestjs/common';
import { PollingsService } from './pollings.service';
import { PollingsController } from './pollings.controller';

@Module({
  controllers: [PollingsController],
  providers: [PollingsService]
})
export class PollingsModule {}
