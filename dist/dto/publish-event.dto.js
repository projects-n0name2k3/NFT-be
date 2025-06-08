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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishEventDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const create_artist_class_dto_1 = require("../dto/create-artist-class.dto");
const create_ticket_tier_dto_1 = require("./create-ticket-tier.dto");
const date_order_constraint_1 = require("../common/validators/date-order.constraint");
class PublishEventDto {
    name;
    venue;
    sellStartDate;
    sellEndDate;
    eventStartDate;
    eventEndDate;
    description;
    location;
    maxPerUser;
    ticketTiers;
    artistClasses;
    thumbnailUrl;
    coverPhotoUrl;
    seatmapUrl;
}
exports.PublishEventDto = PublishEventDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Event name',
        example: 'Concert ABC',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PublishEventDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Venue of event',
        example: 'TP building',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PublishEventDto.prototype, "venue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start day for sell',
        example: '2025-04-01T00:00:00Z',
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Validate)(date_order_constraint_1.DateOrderConstraint),
    __metadata("design:type", String)
], PublishEventDto.prototype, "sellStartDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End day for sell',
        example: '2025-04-30T23:59:59Z',
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PublishEventDto.prototype, "sellEndDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start day for event',
        example: '2025-05-15T18:00:00Z',
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PublishEventDto.prototype, "eventStartDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End day of event',
        example: '2025-05-15T22:00:00Z',
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PublishEventDto.prototype, "eventEndDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Description of event',
        example: 'Music night with top artists..',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PublishEventDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Detailed location',
        example: 'District 1, Ho Chi Minh City 0.000000 0.000000',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PublishEventDto.prototype, "location", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PublishEventDto.prototype, "maxPerUser", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'ticketTiers must be an array' }),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least 1 ticket tier is required' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_ticket_tier_dto_1.TicketTierDto),
    __metadata("design:type", Array)
], PublishEventDto.prototype, "ticketTiers", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'artistClasses must be an array' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_artist_class_dto_1.ArtistClassDto),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least 1 artist class.' }),
    __metadata("design:type", Array)
], PublishEventDto.prototype, "artistClasses", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PublishEventDto.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PublishEventDto.prototype, "coverPhotoUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PublishEventDto.prototype, "seatmapUrl", void 0);
//# sourceMappingURL=publish-event.dto.js.map