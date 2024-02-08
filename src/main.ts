import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const openApi = new DocumentBuilder()
    .setTitle('UserWay Authentication Service')
    .setDescription('Authentication service for UserWay')
    .setVersion('1.0')
    .addTag('auth', 'Authentication')
    .addTag('users', 'Users')
    .addBearerAuth()
    .build()
  const swagger = SwaggerModule.createDocument(app, openApi);
  
  SwaggerModule.setup('/docs', app, swagger);

  await app.listen(3000);
}

bootstrap();
