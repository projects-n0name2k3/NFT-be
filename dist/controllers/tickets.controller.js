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
exports.TicketsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const swagger_2 = require("@nestjs/swagger");
const joi_1 = require("joi");
const user_decorator_1 = require("../common/decorators/user.decorator");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const dto_1 = require("../dto");
const get_ticket_inventory_dto_1 = require("../dto/get-ticket-inventory.dto");
const search_resale_ticket_dto_1 = require("../dto/search-resale-ticket.dto");
const search_ticket_dto_1 = require("../dto/search-ticket.dto");
const statictis_dto_1 = require("../dto/statictis.dto");
const services_1 = require("../services");
const nft_tickets_service_1 = require("../services/nft-tickets.service");
const revenue_chart_service_1 = require("../services/revenue-chart.service");
let TicketsController = class TicketsController {
    blockchainSnapshotsService;
    ticketTiersService;
    nftTicketsService;
    revenueService;
    ticketSaleService;
    constructor(blockchainSnapshotsService, ticketTiersService, nftTicketsService, revenueService, ticketSaleService) {
        this.blockchainSnapshotsService = blockchainSnapshotsService;
        this.ticketTiersService = ticketTiersService;
        this.nftTicketsService = nftTicketsService;
        this.revenueService = revenueService;
        this.ticketSaleService = ticketSaleService;
    }
    async getNftTicketsByUser(user, query) {
        const result = await this.nftTicketsService.getNftTicketsByUser(user, query);
        return {
            status: common_1.HttpStatus.OK,
            message: 'NFT tickets fetched successfully',
            data: result,
        };
    }
    async getNftTicketDetails(user, payload) {
        const result = await this.nftTicketsService.getNftTicketDetails(user, payload);
        return {
            status: common_1.HttpStatus.OK,
            message: 'NFT ticket details fetched successfully',
            data: result,
        };
    }
    async checkTicketMintStatus(transaction_hash) {
        this.nftTicketsService.checkTicketMintStatus(transaction_hash);
    }
    async getTicketsByTier(eventId, query) {
        const result = await this.nftTicketsService.getTicketsByTier(eventId, query);
        return {
            status: common_1.HttpStatus.OK,
            message: 'Nft tickets fetched by ticket tiers successfully',
            data: result,
        };
    }
    async verifyResaleCreationStatus(payload, user) {
        const status = await this.blockchainSnapshotsService.verifyResaleCreationStatus(payload, user);
        return {
            status: common_1.HttpStatus.OK,
            message: 'Resale creation status verified successfully',
            data: {
                status,
            },
        };
    }
    async getRevenueChart(user, getStatisticsDto) {
        const result = await this.revenueService.getStatisticsData(user, getStatisticsDto);
        return {
            status: common_1.HttpStatus.OK,
            message: 'Get chart successfully',
            data: result,
        };
    }
    async getTicketSold(user, eventId) {
        const result = await this.revenueService.getTicketsSoldStats(user, eventId);
        return {
            status: common_1.HttpStatus.OK,
            message: 'Get chart successfully',
            data: result,
        };
    }
    async sortingTicketResaleByPrice(query) {
        const result = await this.nftTicketsService.getResaleTicketByPrice(query);
        return {
            status: common_1.HttpStatus.OK,
            message: 'Resale ticket is fetched by min and max price successfully',
            data: result,
        };
    }
    async verifyResaleCancellationStatus(payload, user) {
        const status = await this.blockchainSnapshotsService.verifyResaleCancellationStatus(payload, user);
        return {
            status: common_1.HttpStatus.OK,
            message: 'Resale cancellation status verified successfully',
            data: {
                status,
            },
        };
    }
    async verifyBuyResaleTicketStatus(payload, user) {
        const status = await this.blockchainSnapshotsService.verifyBuyResaleTicketStatus(payload, user);
        return {
            status: common_1.HttpStatus.OK,
            message: 'Buy resale ticket status verified successfully',
            data: {
                status,
            },
        };
    }
    async getResaleTicketDetails(id) {
        const result = await this.nftTicketsService.getResaleTicketDetails(id);
        return {
            status: common_1.HttpStatus.OK,
            message: 'Get ticket resale details successfully',
            data: result,
        };
    }
    async getTicketTiers({ tierId }) {
        const ticketTier = await this.ticketTiersService.getTicketTierDetails(tierId);
        return {
            status: common_1.HttpStatus.OK,
            message: 'Get ticket tier details successfully',
            data: {
                ticketTier,
            },
        };
    }
    async getSellingTicketByUser(user, query) {
        const result = await this.ticketSaleService.getSellingTicketByUserId(user, query);
        return {
            status: common_1.HttpStatus.OK,
            message: 'Get selling ticket by user successfully',
            data: result,
        };
    }
};
exports.TicketsController = TicketsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get ticket inventory by user' }),
    (0, swagger_2.ApiQuery)({ type: get_ticket_inventory_dto_1.GetTicketsByUserDto }),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'NFT tickets fetched successfully',
    }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Get)('inventory'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TokenPayloadDto,
        get_ticket_inventory_dto_1.GetTicketsByUserDto]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getNftTicketsByUser", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get NFT ticket details' }),
    (0, swagger_1.ApiParam)({ name: 'tierId', type: String, required: true }),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'NFT ticket details fetched successfully',
    }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Get)('details/:nftTicketId'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TokenPayloadDto,
        dto_1.GetNftTicketDetailDto]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getNftTicketDetails", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Check ticket mint status after buying' }),
    (0, swagger_1.ApiBody)({ type: joi_1.string }),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'NFT tickets fetched successfully',
    }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Get)('check/mint/status'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "checkTicketMintStatus", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Filter tickets by tier of specific event' }),
    (0, common_1.Get)('nft-tickets/:eventId'),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, search_ticket_dto_1.GetTicketsByTierDto]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getTicketsByTier", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Verify resale creation status' }),
    (0, swagger_1.ApiBody)({ type: dto_1.VerifyResaleCreationStatusDto }),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Resale creation status verified successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Transaction hash or sale id is not match',
    }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Post)('resale/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.VerifyResaleCreationStatusDto,
        dto_1.TokenPayloadDto]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "verifyResaleCreationStatus", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get revenue chart statistics' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Revenue statistics retrieved successfully',
    }),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Get)('/chart'),
    (0, swagger_2.ApiQuery)({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for statistics period',
    }),
    (0, swagger_2.ApiQuery)({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for statistics period',
    }),
    (0, swagger_2.ApiQuery)({
        name: 'periodType',
        required: false,
        enum: statictis_dto_1.TimePeriod,
        description: 'Type of time period for grouping data',
    }),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TokenPayloadDto,
        statictis_dto_1.GetStatisticsDto]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getRevenueChart", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get tickets sold by event' }),
    (0, swagger_2.ApiQuery)({
        name: 'eventId',
        required: true,
        type: String,
        description: 'ID of the event to get sold tickets for',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Retrieved tickets sold successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Event not found',
    }),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Get)('/sold'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TokenPayloadDto, String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getTicketSold", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get resale ticket by price' }),
    (0, common_1.Get)('/resale/filter/price'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_resale_ticket_dto_1.SearchResaleTicketDto]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "sortingTicketResaleByPrice", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Verify resale cancellation status' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                saleId: { type: 'number' },
                transactionHash: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Resale cancellation status verified successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Ticket resale not found',
    }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Post)('resale/cancel/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.VerifyResaleCancellationStatusDto,
        dto_1.TokenPayloadDto]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "verifyResaleCancellationStatus", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Verify buy resale ticket status' }),
    (0, swagger_1.ApiBody)({ type: dto_1.VerifyBuyResaleTicketStatusDto }),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Buy resale ticket status verified successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Ticket resale not found or Ticket sale transaction is closed',
    }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Post)('resale/buy/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.VerifyBuyResaleTicketStatusDto,
        dto_1.TokenPayloadDto]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "verifyBuyResaleTicketStatus", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get resale ticket detail' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Get resale ticket detail successfully',
    }),
    (0, common_1.Get)('/resale/details/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getResaleTicketDetails", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get ticket tier details' }),
    (0, swagger_1.ApiParam)({
        name: 'tierId',
        type: String,
        required: true,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Get ticket tier details successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Ticket tier not found',
    }),
    (0, common_1.Get)(':tierId'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GetTicketTierDetailsDto]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getTicketTiers", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get selling ticket by user' }),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Resale cancellation status verified successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Ticket resale not found',
    }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Get)('resale/selling'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TokenPayloadDto,
        get_ticket_inventory_dto_1.GetTicketsByUserDto]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getSellingTicketByUser", null);
exports.TicketsController = TicketsController = __decorate([
    (0, common_1.Controller)('tickets'),
    __metadata("design:paramtypes", [services_1.BlockchainSnapshotsService,
        services_1.TicketTiersService,
        nft_tickets_service_1.NftTicketsService,
        revenue_chart_service_1.RevenueService,
        services_1.TicketSaleTransactionsService])
], TicketsController);
//# sourceMappingURL=tickets.controller.js.map