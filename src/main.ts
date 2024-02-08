import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  const openApi = new DocumentBuilder()
    .setTitle('UserWay Authentication Service')
    .setDescription('Authentication service for UserWay')
    .setVersion('1.0')
    .addTag('auth', 'Authentication')
    .addTag('users', 'Users')
    .addBearerAuth()
    .build();
  const swagger = SwaggerModule.createDocument(app, openApi);

  SwaggerModule.setup('/docs', app, swagger);

  await app.listen(3000);
}

bootstrap();
