import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('Feanut API')
    .setDescription('The feanut API description')
    .setVersion('0.0.1')
    .addTag('User', '회원 API')
    .addTag('School', '학교 API')
    .addTag('Friend', '친구 API')
    .addTag('Vote', '투표 API')
    .addTag('Letter', '편지 API')
    .addTag('Notification', '알림 API')
    .addTag('Subscription', '구독 API')
    .addTag('Coin', '코인 API')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(configService.get('port'));
}
bootstrap();
