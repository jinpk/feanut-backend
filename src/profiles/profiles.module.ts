import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Profile, ProfileSchema } from './schemas/profile.schema';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { ProfilesEventListener } from './profiles.listener';
import { FriendsModule } from 'src/friends/friends.module';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema }]),
    FriendsModule,
    FilesModule,
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService, ProfilesEventListener],
  exports: [ProfilesService],
})
export class ProfilesModule {}
