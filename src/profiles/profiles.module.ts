import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Profile, ProfileSchema } from './schemas/profile.schema';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { Polling, PollingSchema } from '../pollings/schemas/polling.schema';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema }]),
    MongooseModule.forFeature([{ name: Polling.name, schema: PollingSchema }]),
    FilesModule,
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
