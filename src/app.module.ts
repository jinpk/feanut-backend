import * as Joi from 'joi';
import configuration from './config/configuration';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CoinsModule } from './coins/coins.module';
import { FriendsModule } from './friendships/friendships.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PollingsModule } from './pollings/pollings.module';
import { PollsModule } from './polls/polls.module';
import { validationSchema } from './config/config.validation';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { FilesModule } from './files/files.module';
import { ExceptionsFilter } from './common/filters/exceptions.filter';
import { AdminModule } from './admin/admin.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { EmojisModule } from './emojis/emojis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '/secret/.env', 'secret/.env'],
      validationSchema,
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('mongoURI'),
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    UsersModule,
    AuthModule,
    CoinsModule,
    FriendsModule,
    NotificationsModule,
    FilesModule,
    PollingsModule,
    PollsModule,
    AdminModule,
    SchedulerModule,
    EmojisModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilter,
    },
  ],
})
export class AppModule {}
