import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import * as providers from './providers';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

const services = Object.values(providers);

@Global()
@Module({
  imports: [
    HttpModule,
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        defaults: {
          from: '<noreply@feanut.com>',
        },
        transport: `smtp://${configService.get('smtpUser')}:${configService.get(
          'smtpPassword',
        )}@smtp-relay.gmail.com:587`,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: services,
  exports: services,
})
export class CommonModule {}
