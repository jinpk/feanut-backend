import { Module } from '@nestjs/common';
import { CoinsController } from './coins.controller';

@Module({
  controllers: [CoinsController]
})
export class CoinsModule {}
