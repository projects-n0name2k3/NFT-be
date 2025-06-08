"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const Joi = require("joi");
const cache_manager_1 = require("@nestjs/cache-manager");
const controllers = require("./controllers");
const services = require("./services");
const entities = require("./entities");
const jwt_strategy_1 = require("./common/strategies/jwt.strategy");
const jwt_1 = require("@nestjs/jwt");
const schedule_1 = require("@nestjs/schedule");
const blockchain_event_processor_service_1 = require("./services/blockchain-event-processor.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({}),
            schedule_1.ScheduleModule.forRoot(),
            config_1.ConfigModule.forRoot({
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
            cache_manager_1.CacheModule.register({
                isGlobal: true,
                store: 'memory',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    url: configService.getOrThrow('DATABASE_URL'),
                    entities: Object.values(entities),
                    migrations: [__dirname + 'database/migrations/*.ts'],
                    synchronize: false,
                }),
            }),
            typeorm_1.TypeOrmModule.forFeature(Object.values(entities)),
        ],
        controllers: Object.values(controllers),
        providers: [
            ...Object.values(services),
            jwt_strategy_1.JwtStrategy,
            blockchain_event_processor_service_1.BlockchainEventProcessor,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map