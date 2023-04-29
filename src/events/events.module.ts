import { Module } from '@nestjs/common';
import { CoinsModule } from 'src/coins/coins.module';
import { FriendshipsModule } from 'src/friendships/friendships.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { ProfilesModule } from 'src/profiles/profiles.module';
import { UsersModule } from 'src/users/users.module';
import { EventsListener } from './events.listener';
import { SchoolsModule } from 'src/schools/schools.module';

@Module({
  imports: [
    UsersModule,
    ProfilesModule,
    SchoolsModule,
    FriendshipsModule,
    CoinsModule,
    NotificationsModule,
  ],
  providers: [EventsListener],
})
export class EventsModule {}
