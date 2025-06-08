'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const core_1 = require('@nestjs/core');
const app_module_1 = require('./app.module');
const config_1 = require('@nestjs/config');
const swagger_1 = require('@nestjs/swagger');
const swagger_config_1 = require('./config/swagger.config');
const common_1 = require('@nestjs/common');
const cookieParser = require('cookie-parser');
async function bootstrap() {
  const app = await core_1.NestFactory.create(app_module_1.AppModule);
  const configService = app.get(config_1.ConfigService);
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: 'https://nft-4lib.vercel.app/',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new common_1.ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  const document = swagger_1.SwaggerModule.createDocument(
    app,
    swagger_config_1.SwaggerConfig,
  );
  const PORT = configService.getOrThrow('PORT');
  swagger_1.SwaggerModule.setup('api-docs', app, document);
  await app.listen(PORT);
  console.log('APP is running on port ', PORT);
}
bootstrap();
//# sourceMappingURL=main.js.map
