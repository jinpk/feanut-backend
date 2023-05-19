import configuration from './config/configuration';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CoinsModule } from './coins/coins.module';
import { FriendshipsModule } from './friendships/friendships.module';
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
import { EmojisModule } from './emojis/emojis.module';
import { CommonModule } from './common/common.module';
import { EventsModule } from './events/events.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SchoolsModule } from './schools/schools.module';
import { ProfilesModule } from './profiles/profiles.module';
import { PromotionSchoolsModule } from './promotions/schools/schools.module';

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
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    EventsModule,
    CommonModule,
    UsersModule,
    ProfilesModule,
    AuthModule,
    CoinsModule,
    FriendshipsModule,
    FilesModule,
    PollingsModule,
    PollsModule,
    AdminModule,
    NotificationsModule,
    EmojisModule,
    SchoolsModule,
    PromotionSchoolsModule,
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
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // 클라우드런 req, res 로그 수집
    // consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
