import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { CacheModule } from '@nestjs/cache-manager';
import { Request, Response } from 'express';
import * as controllers from './controllers';
import * as services from './services';
import * as entities from './entities';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { BlockchainEventProcessor } from './services/blockchain-event-processor.service';

@Module({
  imports: [
    JwtModule.register({}),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        ACCESS_TOKEN_TTL: Joi.number().required(),
        REFRESH_TOKEN_TTL: Joi.number().required(),
        ENABLE_TOKEN_ROTATION: Joi.boolean().required(),
        NONCE_TTL: Joi.number().required(),
        SMTP_USER: Joi.string().required(),
        SMTP_PASSWORD: Joi.string().required(),
        CLOUDINARY_CLOUD_NAME: Joi.string().required(),
        CLOUDINARY_API_KEY: Joi.string().required(),
        CLOUNDINARY_API_SECRET: Joi.string().required(),
        CLOUNDINARY_FOLDER: Joi.string().required(),
        OTP_CACHE_TTL: Joi.number().required(),
        PINATA_JWT: Joi.string().required(),
        PINATA_API_KEY: Joi.string().required(),
        PINATA_SECRET_KEY: Joi.string().required(),
        EVENT_MANAGEMENT_CONTRACT_ADDRESS: Joi.string().required(),
        METAMASK_PRIVATE_KEY: Joi.string().required(),
        RPC_URL: Joi.string().required(),
      }),
    }),
    CacheModule.register({
      isGlobal: true,
      store: 'memory',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.getOrThrow('DATABASE_URL'), // ví dụ: postgresql://user:pass@host:port/dbname
        entities: Object.values(entities),
        migrations: [__dirname + 'database/migrations/*.ts'],
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature(Object.values(entities)),
  ],
  controllers: Object.values(controllers),
  providers: [
    ...Object.values(services),
    JwtStrategy,
    BlockchainEventProcessor,
  ],
})
export class AppModule {}
