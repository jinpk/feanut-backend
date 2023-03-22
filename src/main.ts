import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');
  const env = configService.get<string>('env');

  if (env !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Feanut API')
      .setDescription('The feanut API description')
      .setVersion('0.0.1')
      .addTag('User', '회원 API')
      .addTag('Profile', '프로필 API')
      .addTag('FriendShip', '친구 API')
      .addTag('Polling', '투표 API')
      .addTag('Poll', 'poll&round API')
      .addTag('Notification', '알림 API')
      .addTag('Coin', '코인 API')
      .addTag('File', '파일 API')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(port);
  Logger.log('Open Swagger: http://localhost:' + port + '/docs');
}
bootstrap();
