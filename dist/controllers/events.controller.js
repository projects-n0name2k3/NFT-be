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
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const role_decorator_1 = require("../common/decorators/role.decorator");
const user_decorator_1 = require("../common/decorators/user.decorator");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const role_guard_1 = require("../common/guards/role.guard");
const create_event_file_validation_pipe_1 = require("../common/pipes/create-event-file-validation.pipe");
const dto_1 = require("../dto");
const search_event_organizer_dto_1 = require("../dto/search-event-organizer.dto");
const user_entity_1 = require("../entities/user.entity");
const services_1 = require("../services");
let EventsController = class EventsController {
    eventsService;
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    async searchEventsForUser(payload) {
        const result = await this.eventsService.searchEventsForUser(payload);
        return {
            status: common_1.HttpStatus.OK,
            message: 'Search events successfully',
            data: {
                ...result,
            },
        };
    }
    async saveEventDraft(user, files, body) {
        const payload = await this.eventsService.parseArrayTicketTierAndArtistClass(body);
        await this.eventsService.saveEventsDraft(user, payload, files);
        return {
            status: common_1.HttpStatus.OK,
            message: 'Event is saved as draft successfully',
        };
    }
    async updateEventDraft(user, files, body, { eventId }) {
        const payload = await this.eventsService.parseArrayTicketTierAndArtistClass(body);
        await this.eventsService.updateEventDraft(eventId, user, payload, files);
        return {
            status: common_1.HttpStatus.OK,
            message: 'Event is updated as draft successfully',
        };
    }
    async getUpcompingEvent() {
        const events = await this.eventsService.getUpcompingEvent();
        return {
            status: common_1.HttpStatus.OK,
            message: 'Get upcoming event successfully',
            data: {
                events,
            },
        };
    }
    async verifyEventInformation(user, files, body) {
        let payload;
        if (typeof body.ticketTiers === 'string' ||
            typeof body.artistClasses === 'string') {
            payload =
                await this.eventsService.parseArrayTicketTierAndArtistClass(body);
        }
        else {
            payload = body;
            payload.ticketTiers = payload.ticketTiers.map((ticketTier) => ({
                name: ticketTier.name,
                price: ticketTier.price,
                royaltyTicketTier: ticketTier.royaltyPercentage,
                quantity: ticketTier.totalSupply,
                maxResalePrice: ticketTier.maxResalePrice,
                minResalePrice: ticketTier.minResalePrice,
                description: ticketTier.description,
            }));
            payload.artistClasses = payload.artistClasses.map((artistClass) => ({
                name: artistClass.name,
                royaltyPercent: artistClass.royaltyPercentage,
                artists: artistClass.artists,
            }));
        }
        const result = await this.eventsService.verifyEventInformation(user, payload, files);
        return {
            status: common_1.HttpStatus.OK,
            message: 'Verify event information successfully',
            data: {
                ...result,
            },
        };
    }
    async searchEventsForOrganizer(tokenPayload, payload) {
        const result = await this.eventsService.searchEventsForOrganizer(tokenPayload, payload.value, payload.page, payload.limit);
        return {
            status: common_1.HttpStatus.OK,
            message: 'Search events successfully',
            data: {
                ...result,
            },
        };
    }
    async checkEventCreationStatus(tokenPayload, payload) {
        const status = await this.eventsService.checkEventCreationStatus(tokenPayload, payload);
        return {
            status: common_1.HttpStatus.OK,
            message: 'Check event creation status successfully',
            data: {
                status,
            },
        };
    }
    async deleteEventDraft(tokenPayload, { eventId }) {
        await this.eventsService.deleteDraftEvent(eventId, tokenPayload.userId);
        return {
            status: common_1.HttpStatus.OK,
            message: 'Event deleted successfully',
        };
    }
    async getEventDetails({ eventId }) {
        const result = await this.eventsService.getEventDetails(eventId);
        return {
            status: common_1.HttpStatus.OK,
            message: 'Get event details successfully',
            data: {
                event: result,
            },
        };
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Search events for user' }),
    (0, swagger_1.ApiConsumes)('application/json'),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        type: 'number',
        description: 'Page number',
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        type: 'number',
        description: 'Limit number',
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
    (0, swagger_1.ApiQuery)({
        name: 'minPrice',
        type: 'number',
        description: 'Min price',
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'maxPrice',
        type: 'number',
        description: 'Max price',
        required: false,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Search events successfully',
    }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SearchEventDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "searchEventsForUser", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Create event as draft' }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, role_guard_1.RoleGuard),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Save event as draft successfully',
    }),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, common_1.Post)('save/draft'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'thumbnailFile', maxCount: 1 },
        { name: 'coverPhotoFile', maxCount: 1 },
        { name: 'seatmapFile', maxCount: 1 },
    ])),
    (0, role_decorator_1.Role)(user_entity_1.UserRole.ORGANIZER),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                thumbnailFile: { type: 'string', format: 'binary' },
                coverPhotoFile: { type: 'string', format: 'binary' },
                seatmapFile: { type: 'string', format: 'binary' },
                payload: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', example: 'ABD' },
                        venue: { type: 'string', example: 'TP building' },
                        sellStartDate: {
                            type: 'string',
                            format: 'date-time',
                            example: '2025-04-01T00:00:00Z',
                        },
                        sellEndDate: {
                            type: 'string',
                            format: 'date-time',
                            example: '2025-04-30T23:59:59Z',
                        },
                        eventStartDate: {
                            type: 'string',
                            format: 'date-time',
                            example: '2025-05-15T18:00:00Z',
                        },
                        eventEndDate: {
                            type: 'string',
                            format: 'date-time',
                            example: '2025-05-15T22:00:00Z',
                        },
                        description: {
                            type: 'string',
                            example: 'Đêm nhạc rock hoành tráng!',
                        },
                        location: {
                            type: 'string',
                            example: 'District 1, Ho Chi Minh City 0.000000 0.000000',
                        },
                        maxPerUser: { type: 'number', example: 10 },
                        ticketTiers: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', example: 'VIP' },
                                    price: { type: 'number', example: 1500000 },
                                    quantity: { type: 'number', example: 100 },
                                    royaltyTicketTier: { type: 'number', example: 20 },
                                    maxResalePrice: { type: 'number', example: 10 },
                                    minResalePrice: { type: 'number', example: 10 },
                                    description: { type: 'string', example: 'abc' },
                                },
                                required: ['name', 'price', 'quantity'],
                            },
                        },
                        artistClasses: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', example: 'Main Performers' },
                                    royaltyPercentageArtist: { type: 'number', example: 30 },
                                    artists: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                name: { type: 'string', example: 'Nguyễn Văn Rock' },
                                                walletAddress: {
                                                    type: 'string',
                                                    example: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
                                                },
                                            },
                                            required: ['name', 'walletAddress'],
                                        },
                                    },
                                },
                                required: ['name', 'royaltyPercentageArtist', 'artists'],
                            },
                        },
                    },
                    required: ['name', 'venue', 'sellStartDate', 'eventStartDate'],
                },
            },
        },
    }),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.UploadedFiles)(new create_event_file_validation_pipe_1.CreateEventFileValidationPipe())),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TokenPayloadDto, Object, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "saveEventDraft", null);
__decorate([
    (0, common_1.Put)('update/draft/:eventId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update event as draft' }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Role)(user_entity_1.UserRole.ORGANIZER),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'thumbnailFile', maxCount: 1 },
        { name: 'coverPhotoFile', maxCount: 1 },
        { name: 'seatmapFile', maxCount: 1 },
    ])),
    (0, swagger_1.ApiParam)({ name: 'eventId', type: 'string', description: 'Event ID' }),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TokenPayloadDto, Object, Object, dto_1.GetEventDetailsDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "updateEventDraft", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get upcoming event' }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiConsumes)('application/json'),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Get upcoming event successfully',
    }),
    (0, common_1.Get)('upcoming'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getUpcompingEvent", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Verify event information to get event metadata url before publishing',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify event information to get event metadata URL before publishing',
    }),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                files: { type: 'object' },
                event: { type: 'object' },
                ticketTiers: { type: 'array' },
                artists: { type: 'array' },
            },
        },
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Verify event information successfully',
        schema: {
            type: 'object',
            properties: {
                eventMetadataUrl: {
                    type: 'string',
                    description: 'URL of the event metadata stored on IPFS',
                },
                ticketMetadataUrl: {
                    type: 'string',
                    description: 'URL of the ticket metadata stored on IPFS',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid event information',
    }),
    (0, common_1.Post)('publish'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Role)(user_entity_1.UserRole.ORGANIZER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'thumbnailFile', maxCount: 1 },
        { name: 'coverPhotoFile', maxCount: 1 },
        { name: 'seatmapFile', maxCount: 1 },
    ])),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TokenPayloadDto, Object, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "verifyEventInformation", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Search events for organizer' }),
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
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Search events successfully',
    }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Role)(user_entity_1.UserRole.ORGANIZER),
    (0, common_1.Get)('organizer'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TokenPayloadDto,
        search_event_organizer_dto_1.SearchEventOrganizerDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "searchEventsForOrganizer", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Check event creation status' }),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiQuery)({
        name: 'transactionHash',
        type: 'string',
        description: 'Transaction hash',
        required: true,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'eventMetadataUrl',
        type: 'string',
        description: 'Event ID',
        required: true,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Check event creation status successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Event not found',
    }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Role)(user_entity_1.UserRole.ORGANIZER),
    (0, common_1.Post)('status'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TokenPayloadDto,
        dto_1.CheckEventCreationStatusDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "checkEventCreationStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, role_guard_1.RoleGuard),
    (0, role_decorator_1.Role)(user_entity_1.UserRole.ORGANIZER),
    (0, swagger_1.ApiOperation)({ summary: 'Delete event draft' }),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiParam)({ name: 'eventId', type: 'string', description: 'Event ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Event deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Event not found',
    }),
    (0, common_1.Delete)('draft/:eventId'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TokenPayloadDto,
        dto_1.GetEventDetailsDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "deleteEventDraft", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get event details' }),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiParam)({ name: 'eventId', type: 'string', description: 'Event ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Get event details successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Event not found',
    }),
    (0, common_1.Get)(':eventId'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GetEventDetailsDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getEventDetails", null);
exports.EventsController = EventsController = __decorate([
    (0, common_1.Controller)('events'),
    __metadata("design:paramtypes", [services_1.EventsService])
], EventsController);
//# sourceMappingURL=events.controller.js.map