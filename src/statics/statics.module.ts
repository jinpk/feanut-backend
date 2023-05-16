import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaticsController } from './statics.controller';
import { StaticsService } from './statics.service';
import { TryOpenLog, TryOpenLogSchema } from './schemas/try-open-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TryOpenLog.name, schema: TryOpenLogSchema }]),
  ],
  controllers: [StaticsController],
  providers: [StaticsService],
  exports: [StaticsService],
})
export class StaticsModule {}
