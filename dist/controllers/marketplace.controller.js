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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dto_1 = require("../dto");
const services_1 = require("../services");
const get_resale_ticket_dto_1 = require("../dto/get-resale-ticket.dto");
let MarketplaceController = class MarketplaceController {
    eventsService;
    nftTicketsService;
    constructor(eventsService, nftTicketsService) {
        this.eventsService = eventsService;
        this.nftTicketsService = nftTicketsService;
    }
    async getEventsForMarketPlace(payload) {
        const result = await this.eventsService.getEventsForMarketplace(payload);
        return {
            status: common_1.HttpStatus.OK,
            message: 'Get event for marketplace successfully',
            data: {
                ...result,
            },
        };
    }
    async getResaleTicket({ eventId }, query) {
        const result = await this.nftTicketsService.getResaleTicket(eventId, query);
        return {
            status: common_1.HttpStatus.OK,
            message: 'Resale ticket is fetched successfully',
            data: result,
        };
    }
};
exports.MarketplaceController = MarketplaceController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get events for marketplace' }),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiQuery)({
        name: 'value',
        type: 'string',
        description: 'Search value',
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'skip',
        type: 'number',
        description: 'Skip',
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'startDate',
        type: 'string',
        description: 'Start date',
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'endDate',
        type: 'string',
        description: 'End date',
        required: false,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Get events for marketplace successfully',
    }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GetEventMarketplaceDto]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getEventsForMarketPlace", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get list resale ticket for specific event' }),
    (0, swagger_1.ApiParam)({
        name: 'eventId',
        type: String,
        required: true,
    }),
    (0, common_1.Get)('/:eventId'),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GetEventDetailsDto,
        get_resale_ticket_dto_1.GetResaleTicketDto]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getResaleTicket", null);
exports.MarketplaceController = MarketplaceController = __decorate([
    (0, swagger_1.ApiTags)('Marketplace'),
    (0, common_1.Controller)('marketplace'),
    __metadata("design:paramtypes", [services_1.EventsService,
        services_1.NftTicketsService])
], MarketplaceController);
//# sourceMappingURL=marketplace.controller.js.map