import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SchoolsModule } from './schools/schools.module';
import { SubsciptionsModule } from './subsciptions/subsciptions.module';
import { CoinsModule } from './coins/coins.module';
import { VotesModule } from './votes/votes.module';
import { FriendsModule } from './friends/friends.module';
import { NotificationsModule } from './notifications/notifications.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('mongoURI'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    SchoolsModule,
    SubsciptionsModule,
    CoinsModule,
    VotesModule,
    FriendsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
