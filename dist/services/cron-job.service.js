"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const blockchain_event_processor_service_1 = require("./blockchain-event-processor.service");
let CronService = CronService_1 = class CronService {
    blockchainEventProcessor;
    isRunning = {};
    logger = new common_1.Logger(CronService_1.name);
    eventTypes = Object.values(blockchain_event_processor_service_1.EventBlockchain);
    constructor(blockchainEventProcessor) {
        this.blockchainEventProcessor = blockchainEventProcessor;
    }
    async handleEvent() {
        await Promise.all(this.eventTypes.map((eventType) => this.handleCron(eventType)));
    }
    async handleCron(eventType) {
        if (this.isRunning[eventType]) {
            this.logger.warn('Cron job skipped because the previous job is still running.');
            return;
        }
        try {
            this.isRunning[eventType] = true;
            this.logger.debug(`Cron job ${eventType} started`);
            const handler = this.blockchainEventProcessor.eventJobHandlers[eventType];
            if (handler) {
                await handler(this.blockchainEventProcessor);
            }
            this.logger.debug('Cron job finished');
        }
        finally {
            this.isRunning[eventType] = false;
        }
    }
};
exports.CronService = CronService;
__decorate([
    (0, schedule_1.Cron)('*/10 * * * * *', { name: 'BlockchainEvents' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronService.prototype, "handleEvent", null);
exports.CronService = CronService = CronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [blockchain_event_processor_service_1.BlockchainEventProcessor])
], CronService);
//# sourceMappingURL=cron-job.service.js.map