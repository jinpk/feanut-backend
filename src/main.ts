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
      .addTag('Friendship', '친구 API')
      .addTag('Polling', '투표 API')
      .addTag('Poll', 'poll&round API')
      .addTag('Emoji', '이모지 관리 API')
      .addTag('Notification', '알림 API')
      .addTag('Coin', '코인 API')
      .addTag('School', '학교 API')
      .addTag('File', '파일 API')
      .addTag('Promotion Schools', '프로모션 학교 API')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
    app.enableCors({ origin: '*' });
  }

  await app.listen(port);
  Logger.log(`Running server on port: ${port}`);
  Logger.log(`Running server with env: ${env}`);
  if (env !== 'production') {
    Logger.log(`OpenAPI: ${configService.get('host')}/docs`);
  }
}
bootstrap();
