import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { SwaggerConfig } from './config/swagger.config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  //set root path
  app.setGlobalPrefix('api/v1');

  //config cors
  app.enableCors({
    origin: 'https://nft-4lib.vercel.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  //config cookies
  app.use(cookieParser());

  //config pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  //config swagger
  const document = SwaggerModule.createDocument(app, SwaggerConfig);
  //get port and ipv4
  const PORT = configService.getOrThrow<number>('PORT');

  SwaggerModule.setup('api-docs', app, document);

  await app.listen(PORT);
  console.log('APP is running on port ', PORT);
}
bootstrap();
