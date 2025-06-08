"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerConfig = void 0;
const swagger_1 = require("@nestjs/swagger");
const SwaggerConfig = new swagger_1.DocumentBuilder()
    .setTitle('NFT Ticket APIs')
    .setDescription('There are API endpoints.')
    .setVersion('1.0')
    .addCookieAuth('access_token', {
    type: 'apiKey',
    in: 'cookie',
    name: 'access_token',
})
    .build();
exports.SwaggerConfig = SwaggerConfig;
//# sourceMappingURL=swagger.config.js.map